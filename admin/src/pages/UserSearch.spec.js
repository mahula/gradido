import { mount } from '@vue/test-utils'
import UserSearch from './UserSearch.vue'

const localVue = global.localVue

const apolloQueryMock = jest.fn().mockResolvedValue({
  data: {
    searchUsers: {
      userCount: 1,
      userList: [
        {
          firstName: 'Bibi',
          lastName: 'Bloxberg',
          email: 'bibi@bloxberg.de',
          creation: [200, 400, 600],
          emailChecked: false,
        },
      ],
    },
  },
})

const toastErrorMock = jest.fn()

const mocks = {
  $t: jest.fn((t) => t),
  $d: jest.fn((d) => d),
  $apollo: {
    query: apolloQueryMock,
  },
  $toasted: {
    error: toastErrorMock,
  },
}

describe('UserSearch', () => {
  let wrapper

  const Wrapper = () => {
    return mount(UserSearch, { localVue, mocks })
  }

  describe('mount', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      wrapper = Wrapper()
    })

    it('has a DIV element with the class.user-search', () => {
      expect(wrapper.find('div.user-search').exists()).toBeTruthy()
    })

    it('calls the API', () => {
      expect(apolloQueryMock).toBeCalledWith(
        expect.objectContaining({
          variables: {
            searchText: '',
            currentPage: 1,
            pageSize: 25,
            notActivated: false,
          },
        }),
      )
    })

    describe('unconfirmed emails', () => {
      beforeEach(async () => {
        await wrapper.find('button.btn-block').trigger('click')
      })

      it('calls API with filter', () => {
        expect(apolloQueryMock).toBeCalledWith(
          expect.objectContaining({
            variables: {
              searchText: '',
              currentPage: 1,
              pageSize: 25,
              notActivated: true,
            },
          }),
        )
      })
    })

    describe('pagination', () => {
      beforeEach(async () => {
        wrapper.setData({ currentPage: 2 })
      })

      it('calls the API with new page', () => {
        expect(apolloQueryMock).toBeCalledWith(
          expect.objectContaining({
            variables: {
              searchText: '',
              currentPage: 2,
              pageSize: 25,
              notActivated: false,
            },
          }),
        )
      })
    })

    describe('user search', () => {
      beforeEach(async () => {
        wrapper.setData({ criteria: 'search string' })
      })

      it('calls the API with search string', () => {
        expect(apolloQueryMock).toBeCalledWith(
          expect.objectContaining({
            variables: {
              searchText: 'search string',
              currentPage: 1,
              pageSize: 25,
              notActivated: false,
            },
          }),
        )
      })

      describe('reset the search field', () => {
        it('calls the API with empty criteria', async () => {
          jest.clearAllMocks()
          await wrapper.find('.test-click-clear-criteria').trigger('click')
          expect(apolloQueryMock).toBeCalledWith(
            expect.objectContaining({
              variables: {
                searchText: '',
                currentPage: 1,
                pageSize: 25,
                notActivated: false,
              },
            }),
          )
        })
      })
    })

    describe('apollo returns error', () => {
      beforeEach(() => {
        apolloQueryMock.mockRejectedValue({
          message: 'Ouch',
        })
        wrapper = Wrapper()
      })

      it('toasts an error message', () => {
        expect(toastErrorMock).toBeCalledWith('Ouch')
      })
    })
  })
})
