
export const saveTashkhisi = (
    className : string,
    mochir : number,
    students : {name : string, percentaget2: number, resultT2: number, tatawaor: number}[]
)=>{
    localStorage.setItem(`tachkhisi-${className}`,
        JSON.stringify({mochir, students}));
};

export const loadTashkhisi = (className : string)=>{
    const data = localStorage.getItem(`tachkhisi-${className}`);
    return data ? JSON.parse(data) as { mochir: number; students: { name: string; percentaget2: number; resultT2: number; tatawaor: number }[] } : null;
};

export const saveGroupeData = (
  className: string,
  students: { name: string; levelT2: string }[]
) => {
  localStorage.setItem(
    `tashkhisi_groupe_${className}`,
    JSON.stringify({ students })
  );
};

export const loadGroupeData = (className: string) => {
  const data = localStorage.getItem(`tashkhisi_groupe_${className}`);
  return data ? JSON.parse(data) as { students: { name: string; levelT2: string }[] } : null;
};