interface Props {
  content: string;
}

const TodayDiaryCard = ({content} : Props) => {

    return (
    <div className="rounded-xl bg-fuchsia-200 p-4 shadow-sm">
      <h3 className="text-md font-semibold mb-2">오늘의 회고</h3>
      {content ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-2">회고를 작성하지 않았어요.</p>
        </div>
      )}
    </div>
  );
}

export default TodayDiaryCard;
