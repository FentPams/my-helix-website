import { removeOuterElementLayer, combineChildrenToSingleDiv, addInViewAnimationToMultipleElements } from '../../utils/helpers.js';

const ColorIconPattern = ['pink', 'lightgreen', 'purple', 'yellow', 'purple', 'yellow', 'lightgreen', 'pink'];
//const ColorCardPattern = ['darkseagreen', 'cornflowerblue'];
const ColorCardPattern = ['darkseagreen', 'cornflowerblue', 'plum', 'lightcoral', 'lightcoral', 'plum','cornflowerblue', 'darkseagreen'];
const ColorNumberPattern = ['lightgreen', 'pink', 'purple'];
const animationConfig = {
  staggerTime: 0.04,
  items: [
    {
      selectors: '.columns-content-wrapper',
      animatedClass: 'fade-up',
      staggerTime: 0.15,
    },
  ],
};

export default function decorate(block) {
  const classes = ['one', 'two', 'three', 'four', 'five'];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('enter');
      }
    });
  });

  const row = block.children[0];
  if (row) {
    block.classList.add(classes[row.children.length - 1]);
  }

  block.querySelectorAll(':scope > div > div').forEach((cell, index) => {
    if (!cell.previousElementSibling) cell.classList.add('columns-left');
    if (!cell.nextElementSibling) cell.classList.add('columns-right');

    const img = cell.querySelector('img');
    if (img) {
      cell.classList.add('columns-image');
      observer.observe(img);
      img.parentElement.closest('p').classList.add('image-wrapper-el');
    } else {
      cell.classList.add('columns-content');
      const wrapper = document.createElement('div');
      wrapper.className = 'columns-content-wrapper';
      while (cell.firstChild) wrapper.append(cell.firstChild);
      cell.append(wrapper);

      // colored icons
      removeOuterElementLayer(cell, '.icon');
      if (block.classList.contains('colored-icon')) {
        cell.querySelector('.icon').classList.add('colored-tag', 'circle', ColorIconPattern[index]);
      }
    }

    // colored number tag in cards
    if (block.classList.contains('colored-number')) {
      cell.querySelector('h4').classList.add('colored-tag', 'number-tag', ColorNumberPattern[index]);
    }
  });

  if (block.classList.contains('single-grid')) {
    combineChildrenToSingleDiv(block);
  }

  if (block.classList.contains('inview-animation')) {
    addInViewAnimationToMultipleElements(animationConfig.items, block, animationConfig.staggerTime);
  }


  if (block.classList.contains('block-intro')) {
    const defaultContent = block.parentElement.previousElementSibling;
    
    const pictures = defaultContent.querySelectorAll('picture');
    pictures[1].classList.add('hidden');
    
    pictures[0].addEventListener('click', () => {
      pictures[0].classList.add('hidden');
      pictures[1].classList.remove('hidden');
    });

    pictures[1].addEventListener('click', () => {
      pictures[1].classList.add('hidden');
      pictures[0].classList.remove('hidden');
    });
  }

  if (block.classList.contains('flip-card')) {
    block.querySelectorAll('.columns-image').forEach((cell, index) => {
      const picture = cell.children[0];
      const heading = cell.children[1];
      const content = cell.children[2];

      heading.style.color = ColorCardPattern[index];

      const frontDiv = document.createElement('div');
      frontDiv.classList.add('flip-card-front');
      frontDiv.style.borderColor = 'LightGrey';
      //frontDiv.style.color = ColorCardPattern[index];
      frontDiv.append(heading);
      frontDiv.append(content);

      const backDiv = document.createElement('div');
      backDiv.classList.add('flip-card-back');
      backDiv.append(picture);

      const innerDiv = document.createElement('div');
      innerDiv.classList.add('flip-card-inner');
      innerDiv.append(frontDiv);
      innerDiv.append(backDiv);

      const flipDiv = document.createElement('div');
      flipDiv.classList.add('flip-card');
      flipDiv.append(innerDiv);

      cell.append(flipDiv);
    });
  }

  if (block.classList.contains('flip-card2')) {
    block.querySelectorAll('.columns-image').forEach((cell, index) => {
      const pictures = cell.querySelectorAll('picture');
      const picture1 = pictures[0];
      const picture2 = pictures[1];

      const frontDiv = document.createElement('div');
      frontDiv.classList.add('flip-card-front');
      frontDiv.style.borderColor = 'LightGrey';
      //frontDiv.style.color = ColorCardPattern[index];
      frontDiv.append(picture1);

      const backDiv = document.createElement('div');
      backDiv.classList.add('flip-card-back');
      backDiv.append(picture2);

      const innerDiv = document.createElement('div');
      innerDiv.classList.add('flip-card-inner');
      innerDiv.append(frontDiv);
      innerDiv.append(backDiv);

      const flipDiv = document.createElement('div');
      flipDiv.classList.add('flip-card');
      flipDiv.append(innerDiv);

      cell.append(flipDiv);
    });
  }
}
