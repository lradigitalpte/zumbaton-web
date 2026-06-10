const TagButton = ({ href = "#0", text }: { href?: string; text: string }) => {
  return (
    <span className="inline-block border border-lime-500/40 bg-lime-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-lime-400">
      {href !== "#0" ? (
        <a href={href} className="hover:text-lime-300">
          {text}
        </a>
      ) : (
        text
      )}
    </span>
  );
};

export default TagButton;
