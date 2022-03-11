import { mount } from '@vue/test-utils'
import Send from './Send'

const sendMock = jest.fn()
sendMock.mockResolvedValue('success')

const localVue = global.localVue

// window.scrollTo = jest.fn()

describe('Send', () => {
  let wrapper

  const propsData = {
    balance: 123.45,
    GdtBalance: 1234.56,
    transactions: [{ balance: 0.1 }],
    pending: true,
  }

  const mocks = {
    $t: jest.fn((t) => t),
    $n: jest.fn((n) => String(n)),
    $store: {
      state: {
        email: 'sender@example.org',
      },
    },
    $apollo: {
      mutate: sendMock,
    },
  }

  const Wrapper = () => {
    return mount(Send, { localVue, mocks, propsData })
  }

  describe('mount', () => {
    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('has a send field', () => {
      expect(wrapper.find('div.gdd-send').exists()).toBeTruthy()
    })

    describe('transaction form', () => {
      beforeEach(async () => {
        wrapper.findComponent({ name: 'TransactionForm' }).vm.$emit('set-transaction', {
          email: 'user@example.org',
          amount: 23.45,
          memo: 'Make the best of it!',
        })
      })
      it('steps forward in the dialog', () => {
        expect(wrapper.findComponent({ name: 'TransactionConfirmation' }).exists()).toBe(true)
      })
    })

    describe('confirm transaction', () => {
      beforeEach(() => {
        wrapper.setData({
          currentTransactionStep: 1,
          transactionData: {
            email: 'user@example.org',
            amount: 23.45,
            memo: 'Make the best of it!',
          },
        })
      })

      it('resets the transaction process when on-reset is emitted', async () => {
        await wrapper.findComponent({ name: 'TransactionConfirmation' }).vm.$emit('on-reset')
        expect(wrapper.findComponent({ name: 'TransactionForm' }).exists()).toBeTruthy()
        expect(wrapper.vm.transactionData).toEqual({
          email: 'user@example.org',
          amount: 23.45,
          memo: 'Make the best of it!',
        })
      })

      describe('transaction is confirmed and server response is success', () => {
        beforeEach(async () => {
          jest.clearAllMocks()
          await wrapper
            .findComponent({ name: 'TransactionConfirmation' })
            .vm.$emit('send-transaction')
        })

        it('calls the API when send-transaction is emitted', async () => {
          expect(sendMock).toBeCalledWith(
            expect.objectContaining({
              variables: {
                email: 'user@example.org',
                amount: 23.45,
                memo: 'Make the best of it!',
              },
            }),
          )
        })

        it('emits update-balance', () => {
          expect(wrapper.emitted('update-balance')).toBeTruthy()
          expect(wrapper.emitted('update-balance')).toEqual([[23.45]])
        })

        it('shows the succes page', () => {
          expect(wrapper.find('div.card-body').text()).toContain('form.send_transaction_success')
        })
      })

      describe('transaction is confirmed and server response is error', () => {
        beforeEach(async () => {
          jest.clearAllMocks()
          sendMock.mockRejectedValue({ message: 'recipient not known' })
          await wrapper
            .findComponent({ name: 'TransactionConfirmation' })
            .vm.$emit('send-transaction')
        })

        it('shows the error page', () => {
          expect(wrapper.find('.test-send_transaction_error').text()).toContain(
            'form.send_transaction_error',
          )
        })

        it('shows recipient not found', () => {
          expect(wrapper.find('.test-receiver-not-found').text()).toContain(
            'transaction.receiverNotFound',
          )
        })
      })
    })
  })
})