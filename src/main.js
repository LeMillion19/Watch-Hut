import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import firebase from 'firebase'

Vue.config.productionTip = false

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBOwr6SZwMyQQc_zm2pzVU6EsX0we_G6dg",
  authDomain: "the-watch-hut.firebaseapp.com",
  projectId: "the-watch-hut",
  storageBucket: "the-watch-hut.appspot.com",
  messagingSenderId: "264691841302",
  appId: "1:264691841302:web:242b6762a0bf3956d6f837"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
