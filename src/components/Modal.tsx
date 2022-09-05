import React from "react";

import {
  Button,
  Modal as ChakraModal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps as ChakraModalProps,
  TypographyProps,
} from "@chakra-ui/react";

interface ModalProps extends Omit<ChakraModalProps, "children"> {
  bodyChildren: React.ReactNode;
  footerChildren?: React.ReactNode;
  headerOptions?: {
    title?: string;
    fontSize?: TypographyProps["fontSize"];
  };
}

export function Modal({
  onClose,
  bodyChildren,
  footerChildren,
  headerOptions,
  ...rest
}: ModalProps) {
  return (
    <ChakraModal size={{ base: "xs", sm: "md" }} onClose={onClose} {...rest}>
      <ModalOverlay />
      <ModalContent mx={{ base: "2", md: "0" }}>
        <ModalHeader fontSize={headerOptions?.fontSize ?? ""}>
          {headerOptions?.title ?? ""}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={{ base: "1", md: "2" }} px={{ base: "4", md: "6" }}>
          {bodyChildren}
        </ModalBody>
        <ModalFooter>
          {footerChildren ?? (
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  );
}
