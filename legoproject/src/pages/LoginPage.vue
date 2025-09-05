<template>
  <div>
    <h2 v-if="!isLoggedIn">Login</h2>
    <p>{{ loginStatusMessage }}</p>
    
    <form v-if="!isLoggedIn" @submit.prevent="login">
      <label>
        Username:
        <input v-model="name" required />
      </label>
      <br />
      <label>
        Password:
        <input v-model="password" type="password" required />
      </label>
      <br />
      <button type="submit" style="margin-right: 10px;">Login</button>
      <button type="button" @click="register">Register</button>
    </form>
    
    <div v-else>
      <button @click="logout">Logout</button>
    </div>

    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      password: '',
      errorMessage: '',
      isLoggedIn: false,
      loggedInUsername: ''
    };
  },
  computed: {
    loginStatusMessage() {
      return this.isLoggedIn 
        ? `Logged in as: ${this.loggedInUsername}` 
        : "Not logged in";
    }
  },
  created() {
    const savedUserId = localStorage.getItem("user_id");
    const savedUsername = localStorage.getItem("username");
    if (savedUserId && savedUsername) {
      this.isLoggedIn = true;
      this.loggedInUsername = savedUsername;
    }
  },
  methods: {
    async login() {
      this.errorMessage = '';
      try {
        const response = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: this.name, password: this.password }),
        });

        if (!response.ok) {
          const err = await response.json();
          this.errorMessage = err.error || "Login failed";
          return;
        }

        const data = await response.json();
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("username", this.name);
        this.isLoggedIn = true;
        this.loggedInUsername = this.name;
        this.errorMessage = '';
      } catch {
        this.errorMessage = "Network error";
      }
    },

    async register() {
      this.errorMessage = '';
      try {
        if (!this.name || !this.password) {
          this.errorMessage = "Please enter both username and password to register.";
          return;
        }
        const response = await fetch("http://localhost:3000/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: this.name, password: this.password }),
        });

        if (!response.ok) {
          const err = await response.json();
          this.errorMessage = err.error || "Registration failed";
          return;
        }

        alert("Registration successful! Please log in.");
      } catch {
        this.errorMessage = "Network error during registration";
      }
    },

    logout() {
      localStorage.removeItem("user_id");
      localStorage.removeItem("username");
      this.isLoggedIn = false;
      this.loggedInUsername = '';
      this.name = '';
      this.password = '';
    }
  }
};
</script>
