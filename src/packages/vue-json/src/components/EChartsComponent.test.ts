import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { EChartsComponent } from './EChartsComponent';

// Mock echarts
const mockChartInstance = {
  setOption: vi.fn(),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
  isDisposed: vi.fn(() => false),
};

const mockEcharts = {
  init: vi.fn(() => mockChartInstance),
  version: '5.4.3',
};

vi.mock('echarts', () => ({
  default: mockEcharts,
}));

describe('EChartsComponent', () => {
  const basicOption = {
    xAxis: { type: 'category', data: ['A', 'B', 'C'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [1, 2, 3] }],
  };

  it('should render container div', () => {
    const wrapper = mount(EChartsComponent, {
      props: {
        option: basicOption,
      },
    });

    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('should have default width and height', () => {
    const wrapper = mount(EChartsComponent, {
      props: {
        option: basicOption,
      },
    });

    const div = wrapper.find('div');
    expect(div.element.style.width).toBe('100%');
    expect(div.element.style.height).toBe('400px');
  });

  it('should accept custom width and height', () => {
    const wrapper = mount(EChartsComponent, {
      props: {
        option: basicOption,
        width: 600,
        height: 300,
      },
    });

    const div = wrapper.find('div');
    expect(div.element.style.width).toBe('600px');
    expect(div.element.style.height).toBe('300px');
  });

  it('should emit ready event on mount', async () => {
    const wrapper = mount(EChartsComponent, {
      props: {
        option: basicOption,
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('ready')).toBeDefined();
  });

  it('should update chart when option changes', async () => {
    const wrapper = mount(EChartsComponent, {
      props: {
        option: basicOption,
      },
    });

    await wrapper.vm.$nextTick();
    mockChartInstance.setOption.mockClear();

    const newOption = {
      ...basicOption,
      series: [{ type: 'bar', data: [4, 5, 6] }],
    };

    await wrapper.setProps({ option: newOption });
    
    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350));
    
    expect(mockChartInstance.setOption).toHaveBeenCalled();
  });

  it('should call showLoading when loading prop is true', async () => {
    const wrapper = mount(EChartsComponent, {
      props: {
        option: basicOption,
        loading: true,
      },
    });

    await wrapper.vm.$nextTick();
    expect(mockChartInstance.showLoading).toHaveBeenCalled();
  });

  it('should call hideLoading when loading prop changes to false', async () => {
    const wrapper = mount(EChartsComponent, {
      props: {
        option: basicOption,
        loading: true,
      },
    });

    await wrapper.vm.$nextTick();
    mockChartInstance.hideLoading.mockClear();

    await wrapper.setProps({ loading: false });
    expect(mockChartInstance.hideLoading).toHaveBeenCalled();
  });

  it('should cleanup on unmount', async () => {
    const wrapper = mount(EChartsComponent, {
      props: {
        option: basicOption,
      },
    });

    await wrapper.vm.$nextTick();
    await wrapper.unmount();

    expect(mockChartInstance.dispose).toHaveBeenCalled();
  });

  it('should expose getChart method', () => {
    const wrapper = mount(EChartsComponent, {
      props: {
        option: basicOption,
      },
    });

    expect(wrapper.vm.getChart).toBeDefined();
  });

  it('should expose resize method', () => {
    const wrapper = mount(EChartsComponent, {
      props: {
        option: basicOption,
      },
    });

    expect(wrapper.vm.resize).toBeDefined();
    expect(typeof wrapper.vm.resize).toBe('function');
  });
});
