import { defineComponent } from 'vue';

export const Slot = defineComponent({
  name: 'Slot',
  setup(_, { slots }) {
    return () => {
      if (slots.default) {
        return slots.default();
      }
      return null;
    };
  },
});
