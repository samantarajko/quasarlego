<template>
  <div class="q-pl-xl">
    <h2 v-if="!isLoggedIn">Login</h2>
    <p :class="isLoggedIn ? 'logged-in-text' : ''">{{ loginStatusMessage }}</p>
    
    <form v-if="!isLoggedIn" @submit.prevent="login" class="form-container">
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
      <div class="button-row">
        <button type="submit" class="btn btn-login" style="margin-right:10px;">Login</button>
        <button type="button" @click="register" class="btn btn-login">Register</button>
      </div>
    </form>
    
    <div v-else class="button-row">
      <button @click="logout" class="btn btn-logout">Logout</button>
    </div>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
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
          headers: { "Content-Type": "application/json" },
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
          headers: { "Content-Type": "application/json" },
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

<style scoped>
.form-container {
  max-width: 320px;
  margin-top: 1rem;
}
.button-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 1rem;
}
.btn {
  padding: 8px 16px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
}
.btn-login {
  background-color: #90caf9;
  color: #0d47a1;
  transition: background-color 0.3s ease;
}
.btn-login:hover {
  background-color: #64b5f6;
}
.btn-logout {
  background-color: #bf0a30;
  color: white;
  transition: background-color 0.3s ease;
}
.btn-logout:hover {
  background-color: #9b081f;
}
.error-text {
  color: red;
  margin-top: 1rem;
  font-weight: 600;
}
.logged-in-text {
  font-size: 2rem;
  font-weight: bold;
}
</style>
