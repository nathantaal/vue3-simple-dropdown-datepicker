import { createApp } from 'vue'

import App from './App.vue'
import DateDropdownPlugin from 'vue3-simple-dropdown-datepicker'


const app = createApp(App)
app.use(DateDropdownPlugin);

app.mount('#app')