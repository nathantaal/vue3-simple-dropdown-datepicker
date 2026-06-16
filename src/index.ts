import type { App, Plugin } from 'vue';
import SimpleDropdownDatepicker from './SimpleDropdownDatepicker.vue';

declare module 'vue' {
  interface GlobalComponents {
    SimpleDropdownDatepicker: typeof SimpleDropdownDatepicker;
    'simple-dropdown-datepicker': typeof SimpleDropdownDatepicker;
  }
}

export { SimpleDropdownDatepicker };

export const SimpleDropdownDatepickerPlugin: Plugin = {
  install(app: App) {
    app.component('SimpleDropdownDatepicker', SimpleDropdownDatepicker);
  },
};

export default SimpleDropdownDatepickerPlugin;
