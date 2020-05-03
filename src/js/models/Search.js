import axios from 'axios';
import { url } from '../config';

export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResults() {
    const URL = `${url}search?q=${this.query}`;

    try {
      const res = await axios(URL);
      this.result = res.data.recipes;
      //   console.log(this.result);
    } catch (error) {
      alert(error);
    }
  }
}
