import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook} from "react-redux";
import type { RootState, AppDispatch } from "./store";

// ✅ 타입이 들어간 useDispatch
export const useAppDispatch: () => AppDispatch = useDispatch;

// ✅ 타입이 들어간 useSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
