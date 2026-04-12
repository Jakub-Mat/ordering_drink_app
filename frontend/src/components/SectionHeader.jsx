/**
 * Reusable section header with title and accent line.
 */
export default function SectionHeader({
  title,
  titleClassName = 'text-3xl font-bold mb-2 text-brand-black',
  lineClassName = 'h-1 w-20 bg-brand-blue mb-6 rounded-full',
}) {
  return (
    <>
      <h2 className={titleClassName}>{title}</h2>
      <div className={lineClassName}></div>
    </>
  );
}