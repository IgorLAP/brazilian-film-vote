import React from "react";

import { Button, ButtonProps } from "@chakra-ui/react";

interface CustomButtonProps extends ButtonProps {
  buttonType: "primary" | "danger" | "warn";
  children: React.ReactNode;
}

export function CustomButton({
  buttonType,
  children,
  ...rest
}: CustomButtonProps) {
  const hasW = !!rest.w;
  return (
    <>
      {buttonType === "primary" && (
        <Button
          size={{ base: "xs", sm: "sm", md: "md" }}
          w={hasW ? rest.w : "6rem"}
          bg="blue.500"
          _hover={{ bg: "blue.600" }}
          {...rest}
        >
          {children}
        </Button>
      )}
      {buttonType === "danger" && (
        <Button
          size={{ base: "xs", sm: "sm", md: "md" }}
          w={hasW ? rest.w : "6rem"}
          bg="red.500"
          _hover={{ bg: "red.600" }}
          {...rest}
        >
          {children}
        </Button>
      )}
      {buttonType === "warn" && (
        <Button
          size={{ base: "xs", sm: "sm", md: "md" }}
          bg="yellow.500"
          w={hasW ? rest.w : "6rem"}
          _hover={{ bg: "yellow.600" }}
          {...rest}
        >
          {children}
        </Button>
      )}
    </>
  );
}
