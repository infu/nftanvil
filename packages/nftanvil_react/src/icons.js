import React from "react";

import { createIcon } from "@chakra-ui/react";

export const Zap = createIcon({
  displayName: "Zap",
  viewBox: "0 0 24 24",
  // path can also be an array of elements, if you have multiple paths, lines, shapes, etc.
  path: (
    <polygon
      fill="currentColor"
      points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
    ></polygon>
  ),
});

export const AnvilIcon = createIcon({
  displayName: "UploadIcon",
  viewBox: "0 0 125.36 168.64",
  path: (
    <>
      <path
        d="M46.25,114.52c-13.61-6.4-17.26-21-16.66-31.63A62.83,62.83,0,0,0,50.1,179.58c9.27,3.66,19.89.17,19.95-8.54V166c0-2.47-1.79-4.11-4.29-4.36C53,160.3,40.12,154.87,32.7,142.92h85.77v6.55c0,3.84-1.63,6.08-5,6.8-7.32,1.57-15.81,3.55-23.14,5.12-2.78.63-4.81,2-4.82,4.56V171c.06,8.71,10.69,12.21,20,8.54a63,63,0,0,0,31.24-34.64c4-10.73,4.93-21.91,1.44-32.94-2.32-7.35-3.9-14.09,1.68-18-5.78-4.72-20.48-5.18-33.25,4L82.75,115.09l8.77,12.22L75.35,138.9,56.2,112.19A21.61,21.61,0,0,0,57.36,94l6.77-4.86,12.65,17.64,29.73-21.31c29.5-21.92,8.11-68-28.72-73.07C88.2,32.07,85.22,47,67.43,57.67a80.91,80.91,0,0,0-11.91,8.46,42.83,42.83,0,0,0-12.85,18.6c-3,9.17-2.26,19.42,3.58,29.79Zm-3-44.72c.9-8.07,4.75-15.91,9.27-21.82,4-5.2,5.69-8.93,5.19-14.65,10.12,3.32,9.9,13.74,2.42,19.6C55,57,48.28,62.33,43.3,69.8Zm20.19,69.1a33.22,33.22,0,0,1-31.43-21.41C42.56,130.83,57.88,127.17,63.49,138.9Z"
        transform="translate(-14.97 -12.38)"
      />
    </>
  ),
});

export const UploadIcon = createIcon({
  displayName: "UploadIcon",
  viewBox: "0 0 24 24",
  path: (
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M2.25 4a.25.25 0 00-.25.25v15.5c0 .138.112.25.25.25h3.178L14 10.977a1.75 1.75 0 012.506-.032L22 16.44V4.25a.25.25 0 00-.25-.25H2.25zm3.496 17.5H21.75a1.75 1.75 0 001.75-1.75V4.25a1.75 1.75 0 00-1.75-1.75H2.25A1.75 1.75 0 00.5 4.25v15.5c0 .966.784 1.75 1.75 1.75h3.496zM22 19.75v-1.19l-6.555-6.554a.25.25 0 00-.358.004L7.497 20H21.75a.25.25 0 00.25-.25zM9 9.25a1.75 1.75 0 11-3.5 0 1.75 1.75 0 013.5 0zm1.5 0a3.25 3.25 0 11-6.5 0 3.25 3.25 0 016.5 0z"
    />
  ),
});

export const VerifiedIcon = createIcon({
  displayName: "VerifiedIcon",
  viewBox: "0 0 24 24",
  path: (
    <>
      <path
        d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2475 11.3147 22.2475 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2475 11.3147 22.2475 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41553 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75255 12.6853 1.75255 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41553C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z"
        stroke="none"
        strokeWidth="1.5"
        fill="currentColor"
      />
      <path
        fill="none"
        d="M9 12L11 14L15 10"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
});
