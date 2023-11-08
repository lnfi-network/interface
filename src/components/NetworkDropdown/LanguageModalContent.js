import { dynamicActivate, defaultLocale, locales } from "lib/i18n";
import { importImage } from "lib/legacy";
import cx from "classnames";
import { LANGUAGE_LOCALSTORAGE_KEY } from "config/localStorage";
import checkedIcon from "img/ic_checked.svg";
import { useRef } from "react";
import { setLanguageModalVisible } from "store/reducer/modalReducer";
import { useDispatch } from "react-redux";
export default function LanguageModalContent() {
  const dispatch = useDispatch();
  const currentLanguage = useRef(localStorage.getItem(LANGUAGE_LOCALSTORAGE_KEY) || defaultLocale);
  return Object.keys(locales).map((item) => {
    const image = importImage(`flag_${item}.svg`);
    return (
      <div
        key={item}
        className={cx("network-dropdown-menu-item  menu-item language-modal-item", {
          active: currentLanguage.current === item
        })}
        onClick={async () => {
          await dynamicActivate(item);
          dispatch(setLanguageModalVisible(false));
        }}
      >
        <div className="menu-item-group">
          <div className="menu-item-icon">
            {<img className="network-dropdown-icon" src={image} alt={locales[item]} />}
          </div>
          <span className="network-dropdown-item-label menu-item-label">{locales[item]}</span>
        </div>
        <div className="network-dropdown-menu-item-img">
          {currentLanguage.current === item && <img src={checkedIcon} alt={locales[item]} />}
        </div>
      </div>
    );
  });
}
