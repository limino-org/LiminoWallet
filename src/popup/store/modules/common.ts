interface State {
  theme: string;
  scrollDom: any;
}
interface ScrollOptions {
  left: number;
  top: number;
  behavior: ScrollBehavior;
  id: string;
}
export default {
  state: {
    theme: "light",
  },

  actions: {
    // Scroll to top
    scrollTop(
      { commit, state, dispatch }: any,
      opt: ScrollOptions = {
        id: "page-box",
        left: 0,
        top: 0,
        behavior: "smooth",
      }
    ) {
        const enmu = {
            id: "page-box",
            left: 0,
            top: 0,
            behavior: "smooth",
          }
      const { left, top, behavior, id } = {...enmu,...opt};
      const box = document.getElementById(id);
      if (box) {
        box.scrollTo({ left, top, behavior });
      }
    },
    // Scroll to bottom
    scrollBottom(
      { commit, state, dispatch }: any,
      opt: ScrollOptions = {
        id: "page-box",
        left: 0,
        top: 0,
        behavior: "smooth",
      }
    ) {
        const enmu = {
            id: "page-box",
            left: 0,
            top: 0,
            behavior: "smooth",
          }
      const { left, top, behavior, id } = {...enmu,...opt};
      const box = document.getElementById(id);
      if (box) {
        box.scrollTo({ left, top: box.scrollHeight, behavior });
      }
    },
  },

  namespaced: true,
};
