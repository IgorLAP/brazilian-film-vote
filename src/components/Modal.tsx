import React from "react";

import {
  Button,
  ConditionalValue,
  Dialog,
  DialogRootProps
} from "@chakra-ui/react";
import { UtilityValues } from "@chakra-ui/react/dist/types/styled-system/generated/prop-types.gen";
import { AnyString, CssVars } from "@chakra-ui/react/dist/types/styled-system/generated/system.gen";
import { CssProperties } from "@chakra-ui/react/dist/types/styled-system/css.types";

interface ModalProps extends Omit<DialogRootProps, "children"> {
  bodyChildren: React.ReactNode;
  footerChildren?: React.ReactNode;
  headerOptions?: {
    title?: string;
    fontSize?: ConditionalValue<UtilityValues["fontSize"] | CssVars | CssProperties["fontSize"] | AnyString>;
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
    <Dialog.Root size={{ base: "xs", sm: "md" }} onClose={onClose} open={rest.isOpen} {...rest}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content mx={{ base: "2", md: "0" }}>
          <Dialog.Header fontSize={headerOptions?.fontSize ?? ""}>
            {headerOptions?.title ?? ""}
          </Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body
            py={{ base: "1", md: "2" }}
            px={{ base: "0", sm: "4", md: "6" }}
          >
            {bodyChildren}
          </Dialog.Body>
          <Dialog.Footer>
            {footerChildren}
            <Button
              size={{ base: "xs", sm: "sm", md: "md" }}
              variant="ghost"
              onClick={onClose}
            >
              Fechar
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
