import axios from 'axios';

class Api {
  constructor(baseUrl, settings) {
    this.BASE_URL = baseUrl;
    this.options = settings;
  }
  async fetchImages(request) {
    this.options.params.q = request;
    this.options.params.page = 1;

    const response = await axios.get(this.BASE_URL, this.options);
    return await response.data;
  }
  async fetchMoreImages() {
    this.options.params.page += 1;

    const response = await axios.get(this.BASE_URL, this.options);
    return await response.data;
  }
}
const pixabayApi = new Api('https://pixabay.com/api/', {
  params: {
    key: '39312668-edb80f1d793a3cebe6a0ebf3a',
    q: '',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: 1,
    per_page: 40,
  },
});
export { pixabayApi };
