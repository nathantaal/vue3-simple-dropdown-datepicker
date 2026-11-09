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
    year-label="Year"></simple-dropdown-datepicker>
```

## Props

| Prop               | Type            | Default                 | Description                                          |
| ------------------ | --------------- | ----------------------- | ---------------------------------------------------- |
| `modelValue`       | `Date \| null`  | `null`                  | Controlled value (use with `v-model`).               |
| `dateFormat`       | `string`        | `"yyyymmdd"`            | Order of dropdowns. Use each of `dd`, `mm`, `yyyy` exactly once (case-insensitive); anything else warns and falls back to the default. |
| `locale`           | `string`        | `"en"`                  | BCP 47 tag (e.g. `"nl"`, `"de-CH"`) for month names and the dropdowns' accessible names. Invalid tags warn and fall back to `"en"`. |
| `dayPlaceholder`   | `string`        | "Day" in `locale`       | Placeholder shown in the day dropdown.               |
| `monthPlaceholder` | `string`        | "Month" in `locale`     | Placeholder shown in the month dropdown.             |
| `yearPlaceholder`  | `string`        | "Year" in `locale`      | Placeholder shown in the year dropdown.              |
| `dayLabel`         | `string`        | `""`                    | Visible `<label>` for the day dropdown.              |
| `monthLabel`       | `string`        | `""`                    | Visible `<label>` for the month dropdown.            |
| `yearLabel`        | `string`        | `""`                    | Visible `<label>` for the year dropdown.             |
| `clearable`        | `boolean`       | `false`                 | Keep each placeholder as a selectable option, so the user can empty a field again (emits `null`). |
| `minYear`          | `number`        | year of `min`, else `1970` | Earliest year offered.                            |
| `maxYear`          | `number`        | year of `max`, else `2069` | Latest year offered.                              |
| `min`              | `Date \| null`  | `null`                  | Earliest selectable date. Earlier options are disabled; a selection that still ends up before `min` emits `null`. |
| `max`              | `Date \| null`  | `null`                  | Latest selectable date. Later options are disabled; a selection that still ends up after `max` emits `null`. |

## Events

| Event               | Payload         | Description                                    |
| ------------------- | --------------- | ---------------------------------------------- |
| `update:modelValue` | `Date \| null`  | Used by `v-model`. Emitted when the user changes the date, or when changing `min`/`max` makes the selection valid or invalid; `null` while the selection is outside `min`/`max`. Values set by the parent are not echoed back. |
| `changeDate`        | `Date \| null`  | Same payload as `update:modelValue` (legacy).  |

## Methods

| Method    | Description                                                                 |
| --------- | --------------------------------------------------------------------------- |
| `clear()` | Empties all three dropdowns and emits `null` (if the value wasn't `null` already). Call it through a template ref. |

```vue
<simple-dropdown-datepicker ref="picker" v-model="date" />
<button @click="picker.clear()">Reset</button>
```

## Accessibility

Each dropdown without a visible label (`dayLabel` etc.) gets an `aria-label`
with the localized field name ("day", "month", "year" — or "dag", "maand",
"jaar" for `locale="nl"`). The dropdowns are wrapped in `role="group"`, so
you can name the picker as a whole:

```vue
<simple-dropdown-datepicker v-model="birthday" locale="nl" aria-label="Geboortedatum" />
```

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