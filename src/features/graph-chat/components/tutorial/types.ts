export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  gifPath: string;
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'new-prompt',
    title: 'Create New Prompt',
    description:
      'Click the "New Prompt" button to start a new conversation thread. This creates a new node where you can type your question or message.',
    gifPath: '/demo/newprmpt.gif',
  },
  {
    id: 'send-prompt',
    title: 'Send Your Message',
    description:
      'Type your message in the prompt node and click the send button or press Ctrl+Enter to send it to the AI.',
    gifPath: '/demo/sendprmpt.gif',
  },
  {
    id: 'branching',
    title: 'Branch Conversations',
    description:
      'Create different conversation paths by branching from any response. This lets you explore alternative topics or follow-up questions.',
    gifPath: '/demo/branching.gif',
  },
  {
    id: 'joining',
    title: 'Join Conversations',
    description:
      'Connect different conversation threads together to merge ideas or continue from a previous point in the discussion.',
    gifPath: '/demo/joining.gif',
  },
  {
    id: 'open-data',
    title: 'View Response Data',
    description:
      'Click on the open button on a response node to see the resource within Oceans 3.0.',
    gifPath: '/demo/opendata.gif',
  },
];
