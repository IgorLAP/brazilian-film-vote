import { toast } from "react-toastify";

export function showToast(type: "error" | "success" | "warn", message: string) {
  return toast[type](message, {
    theme: "colored",
    position: "top-right",
    autoClose: 1000,
    hideProgressBar: true,
    closeOnClick: true,
    rtl: false,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    draggable: true,
    style: { background: type === "warn" ? "#D69E2E" : "" },
  });
}
