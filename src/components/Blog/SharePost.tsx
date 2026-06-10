type SharePostProps = {
  url: string;
  title: string;
};

const SharePost = ({ url, title }: SharePostProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const btnClass =
    "inline-flex h-10 w-10 items-center justify-center border border-black/20 bg-white text-gray-600 transition-all hover:border-lime-500 hover:bg-lime-500 hover:text-black dark:border-white/20 dark:bg-black dark:text-zinc-400";

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className={btnClass}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" className="fill-current">
          <path d="M14.3442 0H1.12455C0.499798 0 0 0.497491 0 1.11936V14.3029C0 14.8999 0.499798 15.4222 1.12455 15.4222H14.2942C14.919 15.4222 15.4188 14.9247 15.4188 14.3029V1.09448C15.4688 0.497491 14.969 0 14.3442 0ZM4.57316 13.1089H2.29907V5.7709H4.57316V13.1089ZM3.42362 4.75104C2.67392 4.75104 2.09915 4.15405 2.09915 3.43269C2.09915 2.71133 2.69891 2.11434 3.42362 2.11434C4.14833 2.11434 4.74809 2.71133 4.74809 3.43269C4.74809 4.15405 4.19831 4.75104 3.42362 4.75104ZM13.1947 13.1089H10.9206V9.55183C10.9206 8.7061 10.8956 7.58674 9.72108 7.58674C8.52156 7.58674 8.34663 8.53198 8.34663 9.47721V13.1089H6.07255V5.7709H8.29665V6.79076H8.32164C8.64651 6.19377 9.37122 5.59678 10.4958 5.59678C12.8198 5.59678 13.2447 7.08925 13.2447 9.12897V13.1089H13.1947Z" />
        </svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={btnClass}
      >
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.9831 19.25L9.82094 13.3176L4.61058 19.25H2.40625L8.843 11.9233L2.40625 2.75H8.06572L11.9884 8.34127L16.9034 2.75H19.1077L12.9697 9.73737L19.6425 19.25H13.9831ZM16.4378 17.5775H14.9538L5.56249 4.42252H7.04674L10.808 9.6899L11.4584 10.6039L16.4378 17.5775Z"
            fill="currentColor"
          />
        </svg>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={btnClass}
      >
        <svg width="11" height="20" viewBox="0 0 11 20" className="fill-current">
          <path d="M10.8567 11.25L11.4175 7.63047H7.91602V5.28125C7.91602 4.29141 8.45117 3.32812 10.0766 3.32812H11.5512V0.246094C11.5512 0.246094 10.0453 0 8.60898 0C5.61445 0 3.71094 1.73438 3.71094 4.92188V7.63047H0.417969V11.25H3.71094V20H7.91602V11.25H10.8567Z" />
        </svg>
      </a>
    </div>
  );
};

export default SharePost;
