# vue3-simple-dropdown-datepicker

A Vue 3 datepicker that renders the day, month, and year as three independent dropdowns. Keyboard-friendly, dependency-light, and easy to drop into a form.

## Install

```sh
pnpm add vue3-simple-dropdown-datepicker
# or
npm i vue3-simple-dropdown-datepicker
```

## Usage

Register globally as a plugin:

```ts
import { createApp } from 'vue'
import { SimpleDropdownDatepickerPlugin } from 'vue3-simple-dropdown-datepicker'
import 'vue3-simple-dropdown-datepicker/style.css'
import App from './App.vue'

createApp(App).use(SimpleDropdownDatepickerPlugin).mount('#app')
```

Or import the component directly:

```ts
import { SimpleDropdownDatepicker } from 'vue3-simple-dropdown-datepicker'
```

Then in a template:

```vue
<simple-dropdown-datepicker
  v-model="date"
  :min="new Date(1900, 0, 1)"
  :max="new Date()"
  day-label="Day"
  month-label="Month"
  year-label="Year"
/>
```

## Props

| Prop               | Type            | Default                 | Description                                          |
| ------------------ | --------------- | ----------------------- | ---------------------------------------------------- |
| `modelValue`       | `Date \| null`  | `null`                  | Controlled value (use with `v-model`).               |
| `dateFormat`       | `string`        | `"yyyymmdd"`            | Order of dropdowns. Tokens: `dd`, `mm`, `yyyy`.      |
| `dayPlaceholder`   | `string`        | today's day             | Placeholder shown in the day dropdown.               |
| `monthPlaceholder` | `string`        | today's month           | Placeholder shown in the month dropdown.             |
| `yearPlaceholder`  | `string`        | current year            | Placeholder shown in the year dropdown.              |
| `dayLabel`         | `string`        | `""`                    | Visible `<label>` for the day dropdown.              |
| `monthLabel`       | `string`        | `""`                    | Visible `<label>` for the month dropdown.            |
| `yearLabel`        | `string`        | `""`                    | Visible `<label>` for the year dropdown.             |
| `minYear`          | `number`        | `1970`                  | Earliest year offered.                               |
| `maxYear`          | `number`        | `2069`                  | Latest year offered.                                 |
| `min`              | `Date \| null`  | `null`                  | Earliest selectable date (out-of-range disabled).    |
| `max`              | `Date \| null`  | `null`                  | Latest selectable date (out-of-range disabled).      |

## Events

| Event               | Payload         | Description                                    |
| ------------------- | --------------- | ---------------------------------------------- |
| `update:modelValue` | `Date \| null`  | Used by `v-model`. Emitted when value changes. |
| `changeDate`        | `Date \| null`  | Same payload as `update:modelValue` (legacy).  |

## CSS

Import the bundled stylesheet once in your app:

```ts
import 'vue3-simple-dropdown-datepicker/style.css'
```

## Development

```sh
pnpm install
pnpm dev          # runs the playground
pnpm test         # runs the unit tests
pnpm lint         # runs eslint
pnpm build        # emits dist/ for publishing
```

The repository is a pnpm workspace. The `playground/` package depends on the plugin via `workspace:*` and consumes it by package name, so the dev experience matches a real consumer's.

## License

MIT

## TODO's
* Publish to npm
* Add CI for npm deployment