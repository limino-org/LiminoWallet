<template>
      <van-list
    v-model:loading="loading"
    :finished="finished"
    @load="handleOnLoad"
    v-model:error="error"
  >
      </van-list>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import { List, Toast, Button, Sticky } from "vant";
export default defineComponent({
    name:'coll-list-component',
    components: {
        [List.name]: List
    },
    props: {
        list: {
            type: Array,
            default: []
        }
    },
    setup(props: any) {
        const loading = ref(false)
        const finished = ref(false)
        const error = ref(false)
        const handleOnLoad = () => {

        }
    },
})
</script>
