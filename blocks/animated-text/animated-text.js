import { addInViewAnimationToSingleElement} from '../../utils/helpers.js';

export default function init(el) {
 const h2 = el.querySelector('h2');
 addInViewAnimationToSingleElement(h2, 'text-main-reveal');
}
