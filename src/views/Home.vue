<template>
  <div ref="draggableContainer" id="draggable-container">
    <v-card-title class="justify-center" id="card-title">{{
      currentMovie.title
    }}</v-card-title>
    <v-card
      :loading="isLoading"
      class="mx-auto my-5"
      max-width="500"
      height="600"
    >
      <template slot="progress">
        <v-progress-linear
          color="primary"
          height="10"
          indeterminate
        ></v-progress-linear>
      </template>
      <div
        id="draggable-header"
        v-on:mousedown="dragCard"
        v-on:touchstart="touchStart"
        v-on:touchEndMethod="touchEnd"
      >
        <v-row>
          <v-row
            ><v-img
              class="my-6"
              position="center center"
              :src="movieImage"
              max-height="400"
              contain
            ></v-img
          ></v-row>
          <v-card-text class="text-center">
            <v-row class="mx-3">
              <div>{{ currentMovie.overview }}</div>
            </v-row>
          </v-card-text>
        </v-row>
      </div>
    </v-card>
    <v-card-actions>
      <v-row class="d-flex flex-row justify-center">
        <v-btn class="mx-10" color="green" @click="thumbsUp">
          <v-icon>mdi-thumb-up</v-icon>
        </v-btn>
        <v-btn class="mx-10" color="red" @click="thumbsDown">
          <v-icon>mdi-thumb-down</v-icon>
        </v-btn>
      </v-row>
    </v-card-actions>
    <v-snackbar
      :timeout="3500"
      :value="showToast"
      absolute
      top
      centered
      :color="toastColor"
      transition="toast"
      >{{ toastMessage }}</v-snackbar
    >
  </div>
</template>

<script>
import axios from "axios";
import { db } from "../main";
export default {
  name: "Home",
  data: () => ({
    positions: {
      clientX: undefined,
      clientY: undefined,
      movementX: 0,
      movementY: 0,
    },
    isLoading: false,
    movies: [],
    currentMovie: {},
    currentIndex: 0,
    showToast: false,
    toastColor: "",
    toastMessage: "",
  }),
  created() {
    this.$store.dispatch("user/bindMatchesRef");
    this.fetchMovies(this.userMovieApiPage);
  },
  methods: {
    async fetchMovies(page) {
      const res = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=ba52cf8e887c7233bc01892d3477c104&language=en-US&sort_by=popularity.desc&include_adult=true&include_video=false&page=${page}`
      );

      if (res.data && res.data.results.length > 0) {
        this.movies = res.data.results;
        this.currentMovie = this.movies[0];
      }
    },
    async incrementCurrentIndex() {
      if (this.currentIndex === this.movieResultLength - 1) {
        const newPage = this.userMovieApiPage + 1;
        await db
          .collection("users")
          .doc(this.authUserId)
          .update({ movieApiPage: newPage });

        this.$store.dispatch("user/setMovieApiPage", newPage);
        this.fetchMovies(newPage);
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
        this.currentMovie = this.movies[this.currentIndex];
      }
    },
    async thumbsUp() {
      let userRef = db.collection("users").doc(this.authUserId);

      await userRef.collection("likedMovies").add({ ...this.currentMovie });

      if (this.partnerId) {
        let partnerRef = db.collection("users").doc(this.partnerId);
        const partnerLikedSnapshot = await partnerRef
          .collection("likedMovies")
          .where("id", "==", this.currentMovie.id)
          .get();

        if (!partnerLikedSnapshot.empty) {
          await userRef.collection("matches").add({ ...this.currentMovie });
          await partnerRef.collection("matches").add({ ...this.currentMovie });
          this.toastColor = "success";
          this.toastMessage =
            `You just got a Match on ${this.currentMovie.title}! Click on the heart icon to check them out`
          this.showToast = true;
          setTimeout(() => {this.showToast = false;}, 3600);
        }
      }
      this.incrementCurrentIndex();
    },
    async thumbsDown() {
      await this.incrementCurrentIndex();
      this.showToast = false;
    },

    touchStart(touchEvent) {
      if (touchEvent.changedTouches.length !== 1) {
        // Endast ett finger vi bryr oss om här
        return;
      }
      const posXStart = touchEvent.changedTouches[0].clientX;
      addEventListener(
        "touchend",
        (touchEvent) => this.touchEnd(touchEvent, posXStart),
        { once: true }
      );
    },

    touchEnd(touchEvent, posXStart) {
      if (touchEvent.changedTouches.length !== 1) {
        // We only care if one finger is used
        return;
      }
      const posXEnd = touchEvent.changedTouches[0].clientX;
      if (posXStart < posXEnd - 100) {
        this.thumbsDown(); // swipe right
        console.log("THUMBS DOWN!");
      } else if (posXStart > posXEnd + 150) {
        this.thumbsUp(); // swipe left
        console.log("THUMBS UP!");
      }
      console.log(posXStart);
      console.log(posXEnd);
      console.log("Touch ended");
      console.log(touchEvent);
    },

    dragCard(event) {
      event.preventDefault();
      // get the mouse cursor position at startup:
      this.positions.clientX = event.clientX;
      this.positions.clientY = event.clientY;
      document.onmousemove = this.elementDrag;
      document.onmouseup = this.closeDragElement;
    },
    elementDrag(event) {
      event.preventDefault();
      this.positions.movementX = this.positions.clientX - event.clientX;
      this.positions.movementY = this.positions.clientY - event.clientY;
      this.positions.clientX = event.clientX;
      this.positions.clientY = event.clientY;
      // set the element's new position:
      this.$refs.draggableContainer.style.top =
        !this.$refs.draggableContainer.offsetTop -
        !this.positions.movementY +
        "px";
      this.$refs.draggableContainer.style.left =
        this.$refs.draggableContainer.offsetLeft -
        this.positions.movementX +
        "px";
      console.log(this.positions.clientX + " px");
      console.log(event.offsetX);
    },
    closeDragElement(event) {
      event.preventDefault();
      document.onmouseup = null;
      document.onmousemove = null;
      this.movementY = 0;
      this.$refs.draggableContainer.style.top = this.movementY;
      console.log(event);
      if (this.positions.clientX >= event.offsetX + 500) {
        this.thumbsDown();
        console.log("THUMBS DOWN!!");
        this.movementX = 0;
        this.$refs.draggableContainer.style.left = this.movementX;
      } else {
        this.movementX = 0;
        this.$refs.draggableContainer.style.left = this.movementX;
      }
      if (this.positions.clientX < event.offsetX + 100) {
        this.thumbsUp();
        console.log("THUMBS UP!!");
        this.movementX = 0;
        this.$refs.draggableContainer.style.left = this.movementX;
      } else {
        this.movementX = 0;
        this.$refs.draggableContainer.style.left = this.movementX;
      }
    },
  },
  computed: {
    movieResultLength() {
      return this.movies.length;
    },
    userMovieApiPage() {
      return this.$store.state.user.movieApiPage;
    },
    authUserId() {
      return this.$store.state.user.id;
    },
    partnerId() {
      return this.$store.state.user.partnerId;
    },
    movieImage() {
      return this.currentMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500/${this.currentMovie.poster_path}`
        : "";
    },
  },
};
</script>

<style>
#draggable-container {
  position: relative;
  z-index: 9;
}

#draggable-header {
  z-index: 10;
  cursor: pointer;
}

.toast-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-100px);
}
.toast-leave-active {
  transition: all 0.3s ease;
}

@media only screen and (max-width: 600px) {
  body {
    height: 700px;
    width: 500px;
  }
}
</style>