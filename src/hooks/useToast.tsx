import { useBreakpointValue } from "@chakra-ui/react";
import { toast } from "react-toastify";

export function useToast() {
  const responsive = useBreakpointValue({
    base: true,
    sm: false,
  });

  function showToast(type: "error" | "success" | "warn", message: string) {
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
      style: {
        background: type === "warn" ? "#D69E2E" : "",
        fontSize: responsive ? ".8rem" : "",
        width: responsive ? "240px" : "",
        height: responsive ? "65px" : "",
        margin: responsive ? ".5rem" : "",
      },
    });
  }

  return showToast;
}
