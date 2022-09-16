import { SetupContext, Ref, ref, reactive, defineComponent } from "vue";
// The sidebar hooks 
export const show: Ref<boolean> = ref(false);

export const showSlider = () => {
    show.value = true
}
