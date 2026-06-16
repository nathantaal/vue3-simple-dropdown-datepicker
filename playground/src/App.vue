<template>
  <div class="page">
    <header class="page-header">
      <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="80" height="80" />
      <h1>vue3-simple-dropdown-datepicker</h1>
      <p class="subtitle">A few examples to show what you can do with the component.</p>
    </header>

    <main class="examples">

      <!-- ── 1. Default, no props ───────────────────────────────────────── -->
      <section class="example">
        <h2>1. Default usage</h2>
        <p>
          Just drop the component on your page and it works. The placeholders
          will show today's date parts so the user knows what format is expected.
        </p>
        <simple-dropdown-datepicker />
      </section>

      <!-- ── 2. Dutch placeholders ─────────────────────────────────────── -->
      <section class="example">
        <h2>2. Custom placeholders</h2>
        <p>
          You can override the placeholder text for every dropdown. Handy when
          your application is in an other language then English.
        </p>
        <simple-dropdown-datepicker
          day-placeholder="dag"
          month-placeholder="maand"
          year-placeholder="jaar"
        />
      </section>

      <!-- ── 3. Labels + v-model ───────────────────────────────────────── -->
      <section class="example">
        <h2>3. Labels and v-model</h2>
        <p>
          Pass <code>day-label</code>, <code>month-label</code> and
          <code>year-label</code> to render a visible label above each dropdown.
          Bind <code>v-model</code> if you need the selected date in your component.
          The selected date shows below once all three dropdowns are filled in.
        </p>
        <simple-dropdown-datepicker
          v-model="selectedDate"
          day-label="Day"
          month-label="Month"
          year-label="Year"
        />
        <p v-if="selectedDate" class="result">
          Choosen date: <strong>{{ formattedDate }}</strong>
        </p>
        <p v-else class="result muted">No date selected yet.</p>
      </section>

      <!-- ── 4. Pre-filled model value ─────────────────────────────────── -->
      <section class="example">
        <h2>4. Pre-filled value</h2>
        <p>
          Supply an initial <code>Date</code> object via <code>v-model</code> (or
          <code>:model-value</code>) and the dropdowns will be pre-setted to the
          right values on mount. Useful for edit-forms where you already know
          the date from the database.
        </p>
        <simple-dropdown-datepicker v-model="prefilled" />
        <p class="result muted">
          Model value: <strong>{{ prefilled?.toLocaleDateString('nl-NL') }}</strong>
        </p>
      </section>

      <!-- ── 5. European date format (dd-mm-yyyy) ───────────────────────── -->
      <section class="example">
        <h2>5. European date order</h2>
        <p>
          The <code>date-format</code> prop controls the order of the dropdowns.
          Use <code>"ddmmyyyy"</code> for the European day-month-year order that
          most Dutch users will expect. Any combination of the three tokens
          <code>dd</code>, <code>mm</code> and <code>yyyy</code> is valid.
        </p>
        <simple-dropdown-datepicker
          date-format="ddmmyyyy"
          day-placeholder="dag"
          month-placeholder="maand"
          year-placeholder="jaar"
        />
      </section>

      <!-- ── 6. Restrict the year range ───────────────────────────────── -->
      <section class="example">
        <h2>6. Custom year range</h2>
        <p>
          With <code>min-year</code> and <code>max-year</code> you can limit which
          years appear in the year dropdown. Below we only show years from 2000
          till now, for example for a registration calender of recent events.
        </p>
        <simple-dropdown-datepicker
          :min-year="2000"
          :max-year="currentYear"
          date-format="ddmmyyyy"
        />
      </section>

      <!-- 7. Min / max date -->
      <section class="example">
        <h2>7. Min and max date</h2>
        <p>
          Use <code>:min</code> and <code>:max</code> to grey-out dates that are
          outside the allowed range. Dates that fall outside will be visually
          disabled so the user cannot choose them. Below you can only pick a date
          in the current month.
        </p>
        <simple-dropdown-datepicker
          :min="firstOfMonth"
          :max="lastOfMonth"
          date-format="ddmmyyyy"
        />
      </section>

      <!-- 8. Combining minYear / maxYear with min / max -->
      <section class="example">
        <h2>8. Combining minYear / maxYear with min / max</h2>
        <p>
          <code>min-year</code> and <code>max-year</code> control which years are
          <em>generated</em> in the dropdown — years outside the range do not
          appear at all. <code>:min</code> and <code>:max</code> work on top of
          that: they grey-out the specific months and days that fall outside the
          allowed window, but only inside the years that are already visible.
        </p>
        <p>
          In this example the year list is limited to 2020–{{ currentYear }} with
          <code>min-year</code> / <code>max-year</code>. On top of that,
          <code>:min</code> and <code>:max</code> make sure the user cannot pick
          anything before 1 March 2021 or after 31 October {{ currentYear - 1 }}.
          Pick 2021 and notice that January and February are greyed out; pick
          {{ currentYear - 1 }} and notice the months after October are greyed out.
          Years 2019 and earlier are simply gone from the list.
        </p>
        <simple-dropdown-datepicker
          :min-year="2020"
          :max-year="currentYear"
          :min="combinedMin"
          :max="combinedMax"
          date-format="ddmmyyyy"
        />
      </section>

      <!-- 9. changeDate event -->
      <section class="example">
        <h2>9. The changeDate event</h2>
        <p>
          If you prefer event-driven code instead of <code>v-model</code>, listen
          to <code>@change-date</code>. It fires every time all three dropdowns
          have a value and one of them changes. You get a <code>Date</code> object
          — or <code>null</code> when the selection is cleared.
        </p>
        <simple-dropdown-datepicker
          date-format="ddmmyyyy"
          @change-date="onChangeDate"
        />
        <p class="result">
          Last event payload:
          <strong>{{ lastEvent ?? '—' }}</strong>
        </p>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const now = new Date()

// used by example 3
const selectedDate = ref(null)

// used by example 4 — pre-setted to King's Day 2025
const prefilled = ref(new Date(2025, 3, 26))

// used by example 6
const currentYear = now.getFullYear()

// used by example 7 — first and last day of the current month
const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

// used by example 9
const lastEvent = ref(null)

// used by example 8 — min/max sits inside the minYear/maxYear window
const combinedMin = new Date(2021, 2, 1)   // 1 March 2021
const combinedMax = new Date(now.getFullYear() - 1, 9, 31) // 31 October last year

// formats the date in a human readable way for example 3
const formattedDate = computed(() => {
  if (!selectedDate.value) return null
  return selectedDate.value.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

function onChangeDate(date) {
  if (!date) {
    lastEvent.value = null
    return
  }
  // toISOString gives us a nice string to show in the UI
  lastEvent.value = date.toISOString().slice(0, 10)
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: system-ui, sans-serif;
  background: #f5f5f5;
  margin: 0;
  color: #333;
}

.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.page-header h1 {
  font-size: 1.4rem;
  margin: 0.5rem 0 0.25rem;
}

.subtitle {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.logo {
  display: block;
  margin: 0 auto;
}

.examples {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.example {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
}

.example h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.example p {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #555;
}

.example p:last-child {
  margin-bottom: 0;
}

code {
  background: #f0f0f0;
  border-radius: 0.375rem;
  padding: 0.1em 0.3em;
  font-size: 0.85em;
}

.result {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #333;
}

.result.muted {
  color: #888;
}
</style>
