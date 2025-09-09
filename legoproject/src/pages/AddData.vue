<template>
  <q-page class="q-pa-xl">
    <h2 class="text-h5 q-mb-lg">Add New Data</h2>

    <div class="row q-gutter-md">
      <div class="col" style="border: 1px solid #ccc; border-radius: 12px; padding: 16px;">
        <h4 class="text-subtitle2 q-mb-xs">Add New Franchise</h4>
        <q-form @submit.prevent="addFranchise" class="q-gutter-sm">
          <q-input dense v-model="newFranchise.name" label="Franchise Name" required />
          <q-input dense v-model="newFranchise.description" label="Description" type="textarea" autogrow />
          <q-input dense v-model="newFranchise.country_of_origin" label="Country of Origin" required />
          <q-input dense v-model="newFranchise.founder" label="Founder" />
          <div class="button-center">
            <q-btn dense label="Add Franchise" type="submit" class="lego-red-btn" />
          </div>
        </q-form>
        <q-banner dense v-if="franchiseResult" class="q-mt-xs" :color="franchiseResult.success ? 'green-3' : 'red-3'">
          {{ franchiseResult.message }}
        </q-banner>
      </div>

      <div class="col" style="border: 1px solid #ccc; border-radius: 12px; padding: 16px;">
        <h4 class="text-subtitle2 q-mb-xs">Add New Category</h4>
        <q-form @submit.prevent="addCategory" class="q-gutter-sm">
          <q-input dense v-model="newCategory.name" label="Category Name" required />
          <q-input dense v-model="newCategory.description" label="Description" type="textarea" autogrow />
          <div class="button-center">
            <q-btn dense label="Add Category" type="submit" class="lego-red-btn" />
          </div>
        </q-form>
        <q-banner dense v-if="categoryResult" class="q-mt-xs" :color="categoryResult.success ? 'green-3' : 'red-3'">
          {{ categoryResult.message }}
        </q-banner>
      </div>

      <div class="col" style="border: 1px solid #ccc; border-radius: 12px; padding: 16px;">
        <h4 class="text-subtitle2 q-mb-xs">Add New Lego Set</h4>
        <q-form @submit.prevent="addLegoSet" class="q-gutter-sm">
          <q-input dense v-model="newLegoSet.name" label="Set Name" required />
          <q-input dense v-model.number="newLegoSet.year" label="Year" type="number" required />
          <q-input dense v-model.number="newLegoSet.piece_count" label="Piece Count" type="number" required />
          <q-input dense v-model.number="newLegoSet.price_usd" label="Price (USD)" type="number" step="0.01" required />
          <q-select dense v-model="newLegoSet.franchise_id" :options="franchiseOptions" label="Franchise" emit-value map-options required />
          <q-select dense v-model="newLegoSet.category_id" :options="categoryOptions" label="Category" emit-value map-options required />
          <div class="button-center">
            <q-btn dense label="Add Lego Set" type="submit" class="lego-red-btn" />
          </div>
        </q-form>
        <q-banner dense v-if="legoSetResult" class="q-mt-xs" :color="legoSetResult.success ? 'green-3' : 'red-3'">
          {{ legoSetResult.message }}
        </q-banner>
      </div>
    </div>
  </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const newFranchise = ref({ name: '', description: '', country_of_origin: '', founder: '' });
const newCategory = ref({ name: '', description: '' });
const newLegoSet = ref({ name: '', year: null, piece_count: null, price_usd: null, franchise_id: null, category_id: null });

const franchiseOptions = ref([]);
const categoryOptions = ref([]);

const franchiseResult = ref(null);
const categoryResult = ref(null);
const legoSetResult = ref(null);

const userId = localStorage.getItem('user_id');

onMounted(async () => {
  try {
    const franchisesRes = await axios.get(`http://localhost:3000/api/franchises?user_id=${userId}`);
    franchiseOptions.value = franchisesRes.data.map(f => ({ label: f.name, value: f.id }));
  } catch {
    console.error('Failed to load franchises');
  }

  try {
    const categoriesRes = await axios.get(`http://localhost:3000/api/categories?user_id=${userId}`);
    categoryOptions.value = categoriesRes.data.map(c => ({ label: c.name, value: c.id }));
  } catch {
    console.error('Failed to load categories');
  }
});

async function addFranchise() {
  try {
    await axios.post('http://localhost:3000/api/addfranchise', { ...newFranchise.value, user_id: userId });
    franchiseResult.value = { success: true, message: 'Franchise added successfully' };
    const franchisesRes = await axios.get(`http://localhost:3000/api/franchises?user_id=${userId}`);
    franchiseOptions.value = franchisesRes.data.map(f => ({ label: f.name, value: f.id }));
    newFranchise.value = { name: '', description: '', country_of_origin: '', founder: '' };
  } catch {
    franchiseResult.value = { success: false, message: 'Failed to add franchise' };
  }
}

async function addCategory() {
  try {
    await axios.post('http://localhost:3000/api/addcategory', { ...newCategory.value, user_id: userId });
    categoryResult.value = { success: true, message: 'Category added successfully' };
    const categoriesRes = await axios.get(`http://localhost:3000/api/categories?user_id=${userId}`);
    categoryOptions.value = categoriesRes.data.map(c => ({ label: c.name, value: c.id }));
    newCategory.value = { name: '', description: '' };
  } catch {
    categoryResult.value = { success: false, message: 'Failed to add category' };
  }
}

async function addLegoSet() {
  try {
    await axios.post('http://localhost:3000/api/addlegoset', { ...newLegoSet.value, user_id: userId });
    legoSetResult.value = { success: true, message: 'Lego set added successfully' };
    newLegoSet.value = { name: '', year: null, piece_count: null, price_usd: null, franchise_id: null, category_id: null };
  } catch {
    legoSetResult.value = { success: false, message: 'Failed to add lego set' };
  }
}
</script>

<style scoped>
.row {
  display: flex;
  gap: 16px;
}
.col {
  flex: 1 1 0;
}
.button-center {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}
.lego-red-btn {
  background-color: #BF0A30;
  border-color: #BF0A30;
  color: white;
}
.lego-red-btn:hover {
  background-color: #9B081F;
  border-color: #9B081F;
}
</style>