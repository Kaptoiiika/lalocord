import { localstorageKeys } from "@/shared/const/localstorageKeys"
import { UserModel } from "../types/UserSchema"

const defaultUser: UserModel = {
  id: "You",
  username: "",
}

const genName = () => {
  const first = firstName[Math.floor(Math.random() * firstName.length)]
  const second = secondName[Math.floor(Math.random() * secondName.length)]
  return `${first} ${second}`
}
export const saveUserToLocalStorage = (user: UserModel) => {
  localStorage.setItem(localstorageKeys.USERINFO, JSON.stringify(user))
}

export const getUserFromLocalStorage = (): UserModel => {
  const json = localStorage.getItem(localstorageKeys.USERINFO)
  if (!json) {
    const user: UserModel = {
      id: defaultUser.id,
      username: genName(),
    }
    saveUserToLocalStorage(user)
    return user
  }
  const data = JSON.parse(json)
  const res: UserModel = {
    id: defaultUser.id,
    username: data?.username ? `${data?.username}` : genName(),
  }
  if (!data?.username) saveUserToLocalStorage(res)
  return res
}

const secondName = [
  "тигр",
  "гепард",
  "фламинго",
  "бонобо",
  "павлин",
  "слон",
  "шимпанзе",
  "бородавочник",
  "орангутанг",
  "лев",
  "медведь",
  "горилла",
  "дельфин",
  "петух",
  "конь",
  "кот",
  "пес",
]

const firstName = [
  "хищный",
  "загнанный",
  "дикий",
  "двуногий",
  "невиданный",
  "геральдический",
  "кровожадный",
  "плюшевый",
  "свирепый",
  "разъярённый",
  "четвероногий",
  "лесной",
  "игрушечный",
  "рогатый",
  "обезумевший",
  "убитый",
  "мифический",
  "голодный",
  "сказочный",
  "неведомый",
  "неразумный",
  "раненый",
  "косматый",
  "опасный",
  "крылатый",
  "бешеный",
  "экзотический",
  "дивный",
  "доисторический",
  "мохнатый",
  "фантастический",
  "чудный",
  "заморский",
  "ручной",
  "чудовищный",
  "животный",
  "африканский",
  "страшный",
  "сущий",
  "степной",
  "злобный",
  "фашистский",
  "могучий",
  "волшебный",
  "громадный",
  "обыкновенный",
  "хитрый",
  "полевый",
  "морской",
  "удивительный",
  "пушистый",
  "неизвестный",
  "бедный",
  "настоящий",
  "умный",
  "отвратительный",
  "крупный",
  "злой",
  "мёртвый",
  "странный",
  "незнакомый",
  "необычный",
  "проклятый",
  "ужасный",
  "редкий",
  "живой",
  "грозный",
  "больный",
  "гигантский",
  "ночной",
  "обычный",
  "испуганный",
  "всевозможный",
  "жуткий",
  "жестокий",
  "земной",
  "домашний",
  "взрослый",
  "огромный",
  "чудесный",
  "благородный",
  "прочий",
  "ценный",
  "сильный",
  "разумный",
  "разный",
  "остальный",
  "непонятный",
  "великолепный",
  "мелкий",
  "священный",
  "невидимый",
  "другий",
  "серый",
  "нормальный",
  "магический",
  "добрый",
  "борзый",
]
