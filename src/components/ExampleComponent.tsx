import { ReactNode } from 'react';

interface ExampleComponentProps {
  title: string;
  children: ReactNode;
}

function ExampleComponent({ title, children }: ExampleComponentProps) {
  return (
    <div className="example-component">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default ExampleComponent;
