import dayjs from "dayjs";
import "dayjs/locale/he";

dayjs.locale("he");

export const formatDate = (date: string | Date) =>
  dayjs(date).format("DD/MM/YYYY");

export const formatDateTime = (date: string | Date) =>
  dayjs(date).format("DD/MM/YYYY HH:mm");

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(amount);

export const formatPhone = (phone: string) =>
  phone.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
