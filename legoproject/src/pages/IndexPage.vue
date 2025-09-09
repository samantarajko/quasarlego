<template>
  <q-page class="q-pa-md">
    <div style="font-size: 24px; margin-bottom: 20px;">All Lego Sets</div>
    <q-table
      title="All Lego Sets"
      :rows="legoSets"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      dense
      separator="horizontal"
    >
      <template v-slot:no-data>
        No Lego sets found.
      </template>
    </q-table>

    <div style="font-size: 24px; margin: 40px 0 20px;">Top 3 Most Expensive (Last 5 Years)</div>
    <q-table
      title="Top 3 Expensive Lego Sets"
      :rows="top3LegoSets"
      :columns="columns"
      row-key="id"
      :loading="loadingTop3"
      flat
      bordered
      dense
      separator="horizontal"
    >
      <template v-slot:no-data>
        No top Lego sets found.
      </template>
    </q-table>

    <div style="font-size: 24px; margin: 40px 0 20px;">Top 5 Categories by Piece Count</div>
    <q-table
      title="Top 5 Categories"
      :rows="topCategories"
      :columns="categoryColumns"
      row-key="id"
      :loading="loadingCategories"
      flat
      bordered
      dense
      separator="horizontal"
    >
      <template v-slot:no-data>
        No categories found.
      </template>
    </q-table>

    <div style="font-size: 24px; margin: 40px 0 20px;">Most Popular Category by Country</div>
    <q-table
      title="Most Popular Category by Country"
      :rows="popularCategoryByCountry"
      :columns="popularCategoryColumns"
      row-key="country"
      :loading="loadingPopularCategories"
      flat
      bordered
      dense
      separator="horizontal"
    >
      <template v-slot:no-data>
        No popular categories found.
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const backendMessage = ref("");
const legoSets = ref([]);
const top3LegoSets = ref([]);
const topCategories = ref([]);
const popularCategoryByCountry = ref([]);
const loading = ref(false);
const loadingTop3 = ref(false);
const loadingCategories = ref(false);
const loadingPopularCategories = ref(false);

const columns = [
  { name: "name", label: "Set Name", field: "name", align: "left" },
  { name: "year", label: "Year", field: "year", align: "center" },
  { name: "piece_count", label: "Piece Count", field: "piece_count", align: "right" },
  {
    name: "price_usd",
    label: "Price (USD)",
    field: "price_usd",
    align: "right",
    format: (val) => {
      if (typeof val === "number") {
        return `$${val.toFixed(2)}`;
      }
      return val ? `$${parseFloat(val).toFixed(2)}` : "$0.00";
    },
  },
  { name: "category_name", label: "Category", field: "category_name", align: "left" },
  { name: "franchise_name", label: "Franchise", field: "franchise_name", align: "left" },
];

const categoryColumns = [
  { name: "name", label: "Category Name", field: "name", align: "left" },
  { name: "description", label: "Description", field: "description", align: "left" },
  { name: "total_piece_count", label: "Total Piece Count", field: "total_piece_count", align: "right" },
];

const popularCategoryColumns = [
  { name: "country", label: "Country", field: "country", align: "left" },
  { name: "category", label: "Category", field: "category", align: "left" },
  { name: "count", label: "Count", field: "count", align: "right" },
];

onMounted(async () => {
  const userId = localStorage.getItem("user_id");

  loading.value = true;
  try {
    const res = await axios.get(`http://localhost:3000/api/legosets?user_id=${userId}`);
    legoSets.value = Array.isArray(res.data) ? res.data : [];
  } catch {
    backendMessage.value = "Failed to load Lego sets";
    legoSets.value = [];
  } finally {
    loading.value = false;
  }

  loadingTop3.value = true;
  try {
    const res = await axios.get(`http://localhost:3000/api/legosets/expensive?user_id=${userId}`);
    top3LegoSets.value = Array.isArray(res.data) ? res.data : [];
  } catch {
    top3LegoSets.value = [];
  } finally {
    loadingTop3.value = false;
  }

  loadingCategories.value = true;
  try {
    const res = await axios.get(`http://localhost:3000/api/categories/top?user_id=${userId}`);
    topCategories.value = Array.isArray(res.data) ? res.data : [];
  } catch {
    topCategories.value = [];
  } finally {
    loadingCategories.value = false;
  }

  loadingPopularCategories.value = true;
  try {
    const res = await axios.get(`http://localhost:3000/api/popular-category-by-country?user_id=${userId}`);
    popularCategoryByCountry.value = Array.isArray(res.data) ? res.data : [];
  } catch {
    popularCategoryByCountry.value = [];
  } finally {
    loadingPopularCategories.value = false;
  }
});
</script>
