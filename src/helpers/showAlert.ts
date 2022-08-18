import Swal from "sweetalert2";

export function showAlert({ title, text }) {
  return Swal.fire({
    title,
    text,
    showCancelButton: true,
    icon: "warning",
    color: "#FFF",
    background: "#2D3748",
    iconColor: "#B19E2E",
    cancelButtonColor: "#C53030",
    confirmButtonColor: "#389445",
  });
}
