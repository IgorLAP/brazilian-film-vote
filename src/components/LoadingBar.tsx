import React, { useEffect, useState } from "react";

import { Box } from "@chakra-ui/react";

interface LoadingBarProps {
  status: number;
}

export function LoadingBar({ status }: LoadingBarProps) {
  const [statusBar, setStatusBar] = useState(status);

  useEffect(() => {
    setStatusBar(status);
  }, [status]);

  return (
    <Box
      backgroundColor="green.500"
      h="2"
      w={`${statusBar}%`}
      position="absolute"
      left={0}
      top={0}
      display={statusBar === 0 ? "none" : "block"}
    />
  );
}
