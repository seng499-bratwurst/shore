import { Button } from '@/components/ui/button/button';
import { NodeEdgeControls } from '@/features/graph-chat/components/node-edge-controls';
import { NodeHandles } from '@/features/graph-chat/components/node-handles';
import type { Node, NodeProps } from '@xyflow/react';
import React, { useState } from 'react';
import { FiDownload, FiThumbsDown, FiThumbsUp } from 'react-icons/fi';

type ResponseNodeType = Node<{ sources: { name: string; url: string }[] }>;

// Dummy temperature data until we get LLM integrated
const tempData = [
  ['11:00am', -10],
  ['12:00pm', -9],
  ['1:00pm', -7],
  ['2:00pm', -5],
  ['3:00pm', -3],
];

const ResponseNode: React.FC<NodeProps<ResponseNodeType>> = (props) => {
  const [thumb, setThumb] = useState<'up' | 'down' | null>(null);
  const { data } = props;

  return (
    <div className="relative bg-card text-card-foreground rounded-b-lg shadow-md flex flex-col min-w-[100px] max-w-[300px]">
      <NodeHandles />
      <NodeEdgeControls {...props} />
      <div className="bg-secondary text-secondary-foreground w-full text-sm px-sm py-2xs">
        Response
      </div>
      <div className="flex flex-col px-sm space-y-xs mt-xs">
        <div className="text-sm">Here is the temperature data from March 8th 2024:</div>
        {/* Temporary table placeholder until we determine how we will actually display visual results */}
        <table className="text-sm w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-neutral-200 dark:border-neutral-700 px-2xs py-2xs">
                Time
              </th>
              <th className="border border-neutral-200 dark:border-neutral-700 px-2xs py-2xs">
                Temp (°C)
              </th>
            </tr>
          </thead>
          <tbody>
            {tempData.map(([time, temp], idx) => (
              <tr key={idx}>
                <td className="border border-neutral-200 dark:border-neutral-700 px-2xs py-2xs">
                  {time}
                </td>
                <td className="border border-neutral-200 dark:border-neutral-700 px-2xs py-2xs">
                  {temp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-2xs text-card-foreground">
          Source{data.sources.length > 1 ? 's' : ''}:{' '}
          {data.sources.map((source, index) => (
            <span key={index}>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline">
                {source.name}
              </a>
              {index < data.sources.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center mb-xs">
          <div className="flex">
            <Button
              className="group"
              title="Thumb Up"
              size="icon"
              variant="link"
              onClick={() => setThumb(thumb === 'up' ? null : 'up')}
            >
              {thumb === 'up' ? (
                <FiThumbsUp className="w-icon-sm h-icon-xs text-card-foreground fill-brand-secondary" />
              ) : (
                <FiThumbsUp className="w-icon-sm h-icon-xs text-card-foreground fill-transparent group-hover:fill-brand-secondary/80" />
              )}
            </Button>
            <Button
              className="group"
              title="Thumb Down"
              size="icon"
              variant="link"
              onClick={() => setThumb(thumb === 'down' ? null : 'down')}
            >
              {thumb === 'down' ? (
                <FiThumbsDown className="w-icon-sm h-icon-xs text-card-foreground fill-brand-secondary" />
              ) : (
                <FiThumbsDown className="w-icon-sm h-icon-xs text-card-foreground fill-transparent group-hover:fill-brand-secondary/80" />
              )}
            </Button>
          </div>
          <Button size="icon" variant="secondary" title="Download">
            <FiDownload className="w-icon-md h-icon-md text-secondary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ResponseNode };
