interface ColGroupProps {
    columns: Array<string>;
}

export const ColGroup: React.FC<ColGroupProps> = ({ columns }) => (
  <colgroup>
    {columns.map((width, idx) => (
      <col key={idx} style={{ width }} />
    ))}
  </colgroup>
);