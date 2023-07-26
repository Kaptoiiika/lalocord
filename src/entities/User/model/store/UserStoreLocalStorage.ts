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
    const user = {
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
  "панда",
  "бонобо",
  "павлин",
  "слон",
  "шимпанзе",
  "бородавочники",
  "орангутанг",
  "лев",
  "лама",
  "медведь",
  "горилла",
  "акула",
  "дельфин",
  "курица",
  "лошадь",
  "кошка",
  "собака",
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
  "лесный",
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
  "ручный",
  "чудовищный",
  "животный",
  "африканский",
  "страшный",
  "сущий",
  "степный",
  "злобный",
  "фашистский",
  "могучий",
  "волшебный",
  "громадный",
  "обыкновенный",
  "хитрый",
  "полевый",
  "морский",
  "удивительный",
  "пушистый",
  "неизвестный",
  "бедный",
  "настоящий",
  "умный",
  "отвратительный",
  "крупный",
  "злый",
  "мёртвый",
  "странный",
  "незнакомый",
  "необычный",
  "проклятый",
  "ужасный",
  "редкий",
  "живый",
  "грозный",
  "больный",
  "гигантский",
  "ночный",
  "обычный",
  "испуганный",
  "всевозможный",
  "жуткий",
  "жестокий",
  "земный",
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
]
