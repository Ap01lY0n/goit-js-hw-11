import { pixabayApi } from './js/api-service';
import { MarkUpInterface } from './js/interface-service';

let totalImg = 0;
const ref = {
  form: '.search-form',
  gallery: '.gallery',
  buttonMore: '.load-more',
};
const interFace = new MarkUpInterface(ref);
interFace.setNewElement('checkBox', '.infinity-check');
interFace.form.addEventListener('submit', onShowResult);
interFace.buttonMore.addEventListener('click', loadMorelResult);
interFace.checkBox.addEventListener('change', switchInfiniteScroll);

// Создаем Intersection Observer
const options = {
  root: null, // null означает, что корневой элемент будет viewport
  rootMargin: '0px', // можно настроить отступы, если это необходимо
  threshold: 0.1, // порог, при котором событие считается активным
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadMorelResult(); // Вызывайте вашу функцию загрузки больше изображений при достижении порога
    }
  });
}, options);

// Начните отслеживать кнопку "Загрузить больше", когда флажок включен
function switchInfiniteScroll(evt) {
  const { checked } = evt.currentTarget;

  if (checked) {
    observer.observe(interFace.buttonMore);
  } else {
    observer.unobserve(interFace.buttonMore);
    if (totalImg) {
      interFace.showButtonLoadMore();
    }
  }
}

function onShowResult(evt) {
  evt.preventDefault();
  interFace.hiddenButtonLoadMore();
  interFace.clearGallery();

  const { searchQuery, onScroll } = evt.currentTarget.elements;
  if (!searchQuery.value) {
    interFace.showNotification('Not Found');
    return;
  }
  pixabayApi
    .fetchImages(searchQuery.value)
    .then(data => {
      const { totalHits, hits } = data;
      totalImg = totalHits;

      if (!totalHits) {
        interFace.showNotification('Not Found');
      } else {
        interFace.markUpGallery(hits);
        interFace.showNotification('Founded Images', totalHits);
        totalImg -= hits.length;

        if (totalImg && !onScroll.checked) {
          interFace.showButtonLoadMore();
        }
      }
    })
    .catch(error => console.log(error));
}

function loadMorelResult() {
  const heightGallery = interFace.gallery.scrollHeight;
  const { height: cardHeight } =
    interFace.gallery.firstElementChild.getBoundingClientRect();
  const currentScroll = interFace.gallery.scrollTop;

  const isEndOfPage = currentScroll + interFace.gallery.clientHeight >= heightGallery - cardHeight;

  if (isEndOfPage && !totalImg) {
    observer.unobserve(interFace.buttonMore);
    return;
  } else if (isEndOfPage) {
    pixabayApi
      .fetchMoreImages()
      .then(data => {
        const { hits } = data;

        interFace.markUpGallery(hits);
        interFace.smoothScroll();
        totalImg -= hits.length;

        if (!totalImg) {
          interFace.hiddenButtonLoadMore();
          interFace.showNotification('NoMoreImages');
        }
      })
      .catch(error => console.log(error));
  }
}
