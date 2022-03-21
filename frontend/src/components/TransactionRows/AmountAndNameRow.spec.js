import { mount } from '@vue/test-utils'
import AmountAndNameRow from './AmountAndNameRow'

const localVue = global.localVue

const mocks = {}

const propsData = {
  amount: '19.99',
  text: 'Some text',
}

describe('AmountAndNameRow', () => {
  let wrapper

  const Wrapper = () => {
    return mount(AmountAndNameRow, { localVue, mocks, propsData })
  }

  describe('mount', () => {
    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('renders the component', () => {
      expect(wrapper.find('div.amount-and-name-row').exists()).toBe(true)
    })

    describe('without linked user', () => {
      it('has a span with the text', () => {
        expect(wrapper.find('div.gdd-transaction-list-item-name').text()).toBe('Some text')
      })

      it('has no link', () => {
        expect(wrapper.find('div.gdd-transaction-list-item-name').find('a').exists()).toBe(false)
      })
    })

    describe('with linked user', () => {
      beforeEach(async () => {
        await wrapper.setProps({
          linkedUser: { firstName: 'Bibi', lastName: 'Bloxberg', email: 'bibi@bloxberg.de' },
        })
      })

      it('has a link with first and last name', () => {
        expect(wrapper.find('div.gdd-transaction-list-item-name').text()).toBe('Bibi Bloxberg')
      })

      it('has a link', () => {
        expect(wrapper.find('div.gdd-transaction-list-item-name').find('a').exists()).toBe(true)
      })

      it('links with param email', () => {
        expect(
          wrapper.find('div.gdd-transaction-list-item-name').find('a').attributes('href'),
        ).toBe('/send?email=bibi@bloxberg.de')
      })
    })
  })
})
