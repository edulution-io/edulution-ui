import React from "react";
import {useTranslation} from "react-i18next";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderParameter = (label: string, value: any) => {
  const { t } = useTranslation();

  if (!value) {
    return null;
  }

  const classNameSection = "text-gray-900 mt-2";
  return (
    <div
      className={ classNameSection }
      key={`Email_Parameter_-_${ label }`}
    >
      <div>
        {`${t(label)}: `}
        <span
          className="bg-white border"
        >
          { `${JSON.stringify(value, null, 2)}` }
        </span>
      </div>
    </div>
  )
}

export default renderParameter;
