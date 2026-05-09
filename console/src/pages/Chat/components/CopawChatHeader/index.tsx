import React from "react";
import ChatActionGroup from "../ChatActionGroup";
import ChatSessionInitializer from "../ChatSessionInitializer";
import ModelSelector from "../../ModelSelector";
import styles from "./index.module.less";

interface CopawChatHeaderProps {
  runtimeBridge: React.ReactNode;
}

const CopawChatHeader: React.FC<CopawChatHeaderProps> = ({ runtimeBridge }) => {
  return (
    <div className={styles.header}>
      <ChatSessionInitializer />
      {runtimeBridge}
      <div className={styles.spacer} />
      <ModelSelector />
      <ChatActionGroup />
    </div>
  );
};

export default CopawChatHeader;
