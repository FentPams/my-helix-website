import createTag from '../../utils/tag.js';
import { addInViewAnimationToMultipleElements } from '../../utils/helpers.js';

const animationConfig = {
  staggerTime: 0.4,
  items: [
    {
      selector: 'h2',
      animatedClass: 'slide-reveal-up',
    },
    {
      selectors: 'picture',
      animatedClass: 'fade-up',
      staggerTime: '1.0',
    }],
};

export default function decorate(block) {
  block.classList.add('contained');

  const logoWallLists = [];

  [...block.children].forEach((row) => {

      const title = row.querySelector('h2');
      const picture = row.querySelector('picture');
      const listItem = document.createElement('div');

      if (title) {
        title.setAttribute('class', 'dialog-title');
        listItem.append(title);
      } else {

        listItem.setAttribute('class', 'dialog-list-item');

        const linkEl = row.querySelector('a');
        if (linkEl) {
          const pictureLink = createTag('a', {
            href: linkEl.href,
            title: linkEl.title,
            target: '_blank',
            class: 'dialog-item-link',
            'aria-label': linkEl.textContent,
          }, picture);
  
          listItem.append(pictureLink);
          console.log(pictureLink);
        } 
      }
      logoWallLists.push(listItem);
      listItem.classList.add('inview-animation');
      addInViewAnimationToMultipleElements(animationConfig.items, listItem, animationConfig.staggerTime);
      row.remove();
  });

  logoWallLists.forEach((list) => block.append(list));
}
