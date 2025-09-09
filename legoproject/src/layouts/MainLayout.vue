<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>LEGOS</q-toolbar-title>
        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <div class="q-pa-md flex flex-center">
        <img src="../assets/lego.png" alt="Lego Logo" style="max-width: 360px; max-height: 180px;" />
      </div>
      <q-list>
        <q-item-label header></q-item-label>
        <q-item v-for="link in linksList" :key="link.title" clickable tag="router-link" :to="link.route" active-class="q-item--active">
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.title }}</q-item-label>
            <q-item-label caption>{{ link.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <div class="q-pa-md text-subtitle2" style="text-align: center; border-top: 1px solid #ccc;">
        <span v-if="loggedInUsername">Logged in as: {{ loggedInUsername }}</span>
        <span v-else>Not logged in</span>
      </div>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script setup>
import { ref } from "vue"
const linksList = [
  { title: "Your Legos", caption: "Look at all your Legos here", icon: "home", route: "/" },
  { title: "Add New Legos", caption: "Add new Legos here", icon: "add_box", route: "/adddata" },
  { title: "Login Page", caption: "Login Page", icon: "login", route: "/loginpage" }
]
const leftDrawerOpen = ref(false)
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
const loggedInUsername = ref(null)
if (localStorage.getItem("username")) {
  loggedInUsername.value = localStorage.getItem("username")
}
</script>
