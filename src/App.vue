<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-row justify="center" align="center">
        <v-col class="justify-start">
          <v-btn color="white" v-if="userId" to="/add-partner">
            <v-icon color="black">mdi-account-multiple-plus</v-icon>
          </v-btn>
        </v-col>
        <v-col class="d-flex justify-space-around">
          <v-btn color="white" v-if="userId" to="/home">
            <v-icon color="black">mdi-home</v-icon>
          </v-btn>
          <v-btn color="white" v-if="userId" to="/matches">
            <v-icon color="black">mdi-heart</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-col class="d-flex justify-end">
        <v-btn color="white" v-if="userId" @click="logoutUser">
          <v-icon color="black">mdi-door-open</v-icon>
        </v-btn>
      </v-col>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import firebase from "firebase";
export default {
  name: "App",
  methods: {
    async logoutUser() {
      await firebase.auth().signOut();
      this.$store.dispatch("user/clearUserData");
      this.$router.replace("/");
    },
  },
  computed: {
    userId() {
      return this.$store.state.user.id;
    },
  },
};
</script>
