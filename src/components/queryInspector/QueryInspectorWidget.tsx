import React from 'react';
import { QueryInspectorTrigger } from './QueryInspectorTrigger';
import { QueryInspectorChatbox } from './QueryInspectorChatbox';
import '../../styles/queryInspector.css';

export const QueryInspectorWidget: React.FC = () => {
  return (
    <>
      <QueryInspectorTrigger />
      <QueryInspectorChatbox />
    </>
  );
};
