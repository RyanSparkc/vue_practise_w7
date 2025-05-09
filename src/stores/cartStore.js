/* eslint-disable comma-dangle */
import { defineStore } from 'pinia';
import axios from 'axios';
import useToastMessageStore from '@/stores/toastMessage';

const { VITE_APP_URL, VITE_APP_PATH } = import.meta.env;

export default defineStore('cart', {
  state: () => ({
    carts: [],
    final_total: 0,
    total: 0,
  }),
  actions: {
    getCart() {
      const toastStore = useToastMessageStore();
      axios
        .get(`${VITE_APP_URL}/api/${VITE_APP_PATH}/cart`)
        .then((res) => {
          console.log('購物車 API 回應:', res.data);
          const { carts, total, final_total: apiFinalTotal } = res.data.data;
          this.carts = carts;
          this.total = total;

          // 檢查購物車是否有商品且第一個商品是否有 coupon 資訊
          const hasCoupon = carts.length > 0 && carts[0].coupon;

          if (hasCoupon) {
            // 有優惠券，使用 API 回傳的 final_total (假設是折扣額)
            // 先計算折扣後的金額，再四捨五入
            this.final_total = Math.round(apiFinalTotal);
          } else {
            // 沒有優惠券，總計金額等於小計金額
            // 對 this.total 進行四捨五入
            this.final_total = Math.round(this.total);
          }
          // console.log('pinia cart', this.carts);
        })
        .catch((err) => {
          toastStore.addMessage({
            title: '錯誤',
            content: err.response.data.message,
            style: 'danger',
          });
        });
    },
    addToCart(id) {
      const toastStore = useToastMessageStore();
      const cart = {
        product_id: id,
        qty: 1,
      };
      axios
        .post(`${VITE_APP_URL}/api/${VITE_APP_PATH}/cart`, { data: cart })
        .then((res) => {
          // console.log(res);
          toastStore.addMessage({
            title: '成功',
            content: res.data.message,
            style: 'success',
          });
          this.getCart();
        })
        .catch((err) => {
          toastStore.addMessage({
            title: '錯誤',
            content: err.response.data.message,
            style: 'danger',
          });
        });
    },
    async applyCoupon(code) {
      const toastStore = useToastMessageStore();
      try {
        const res = await axios.post(
          `${VITE_APP_URL}/api/${VITE_APP_PATH}/coupon`,
          {
            data: { code },
          }
        );
        toastStore.addMessage({
          title: '成功',
          content: res.data.message,
          style: 'success',
        });
        // 重新取得購物車資料
        this.getCart();
        return res;
      } catch (err) {
        toastStore.addMessage({
          title: '錯誤',
          content: err.response?.data?.message || '套用優惠券失敗',
          style: 'danger',
        });
        throw err;
      }
    },
    // 新增：更新購物車項目數量
    updateCartItem(item) {
      const toastStore = useToastMessageStore();
      const data = {
        product_id: item.product_id,
        qty: item.qty,
      };
      // 返回 Promise 以便組件處理加載狀態
      return axios
        .put(`${VITE_APP_URL}/api/${VITE_APP_PATH}/cart/${item.id}`, { data })
        .then((res) => {
          toastStore.addMessage({
            title: '成功',
            content: res.data.message,
            style: 'success',
          });
          this.getCart(); // 成功後更新購物車
          return res; // 將響應傳遞下去
        })
        .catch((err) => {
          toastStore.addMessage({
            title: '錯誤',
            content: err.response.data.message,
            style: 'danger',
          });
          throw err; // 拋出錯誤以便組件處理
        });
    },
    // 新增：移除購物車單個項目
    removeCartItem(id) {
      const toastStore = useToastMessageStore();
      // 返回 Promise
      return axios
        .delete(`${VITE_APP_URL}/api/${VITE_APP_PATH}/cart/${id}`)
        .then((res) => {
          toastStore.addMessage({
            title: '成功',
            content: res.data.message,
            style: 'success',
          });
          this.getCart();
          return res;
        })
        .catch((err) => {
          toastStore.addMessage({
            title: '錯誤',
            content: err.response.data.message,
            style: 'danger',
          });
          throw err;
        });
    },
    // 新增：清空購物車
    clearCart() {
      const toastStore = useToastMessageStore();
      // 返回 Promise
      return axios
        .delete(`${VITE_APP_URL}/api/${VITE_APP_PATH}/carts`)
        .then((res) => {
          toastStore.addMessage({
            title: '成功',
            content: res.data.message,
            style: 'success',
          });
          this.getCart();
          return res;
        })
        .catch((err) => {
          toastStore.addMessage({
            title: '錯誤',
            content: err.response.data.message,
            style: 'danger',
          });
          throw err;
        });
    },
  },
});
