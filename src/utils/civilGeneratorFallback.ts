import { CivilResponseData, ToneType, ChannelType, RelevantLaw } from "../types";

export function generateClientCivilResponse(
  complaintText: string,
  keywords: string[] = [],
  tone: ToneType = "standard",
  channel: ChannelType = "official_letter",
  department: string = "민원행정과",
  officerName: string = "담당 주무관",
  includeLaw: boolean = true,
  customDirectives: string = ""
): CivilResponseData {
  const text = (complaintText || "").toLowerCase();

  // Topic classification
  const isTraffic =
    text.includes("주차") ||
    text.includes("차량") ||
    text.includes("도로") ||
    text.includes("단속") ||
    text.includes("신호") ||
    text.includes("골목");
  const isNoise =
    text.includes("소음") ||
    text.includes("층간") ||
    text.includes("공사") ||
    text.includes("시끄") ||
    text.includes("음악") ||
    text.includes("개짖");
  const isWaste =
    text.includes("쓰레기") ||
    text.includes("폐기물") ||
    text.includes("악취") ||
    text.includes("청소") ||
    text.includes("분리수거");
  const isPothole =
    text.includes("포트홀") ||
    text.includes("파손") ||
    text.includes("가로등") ||
    text.includes("보도블록") ||
    text.includes("시설") ||
    text.includes("맨홀");
  const isMalicious =
    text.includes("고소") ||
    text.includes("파면") ||
    text.includes("직무유기") ||
    text.includes("반복") ||
    text.includes("감사실") ||
    tone === "firm";

  let responseTitle = "[회신] 접수하신 민원에 대한 처리결과 안내";
  let threeLineSummary: string[] = [
    "접수된 불편 사항 및 현장 건의 내용의 사실관계 확인",
    "관련 법령 및 행정 운영 지침에 근거한 소관 부서의 타당성 검토",
    "현장 조치 및 향후 주기적 순찰·지도 계획 마련"
  ];
  let extractedKeywords: string[] = keywords.length > 0 ? [...keywords] : ["민원접수", "현장확인", "행정지도", "재발방지"];
  let relevantLaws: RelevantLaw[] = [
    {
      lawName: "민원 처리에 관한 법률",
      article: "제9조 (민원의 접수 및 처리)",
      description: "행정기관은 민원을 접수한 때에는 특별한 사유가 없으면 정해진 처리기간 내에 성실히 처리하여야 함."
    }
  ];

  if (isTraffic) {
    responseTitle = "[답변] 불법주정차 단속 및 보행·교통 불편 해소 요청에 대한 처리결과 안내";
    if (extractedKeywords.length === 0) extractedKeywords = ["불법주정차", "도로교통법", "현장단속", "보행안전"];
    if (includeLaw) {
      relevantLaws.push({
        lawName: "도로교통법",
        article: "제32조 (정차 및 주차의 금지)",
        description: "교차로 모퉁이, 소방시설, 횡단보도, 보도 등 주정차 금지구역 지정 및 과태료 부과 권한 근거."
      });
    }
    threeLineSummary = [
      "불법 주정차 및 도로 통행 장애 민원 접수 및 현장 실태 파악",
      "도로교통법 제32조에 따른 단속 계도 및 이동 조치 명령",
      "상습 구역 대상 고정형/이동형 단속 카메라 및 순찰 강화 계획 수립"
    ];
  } else if (isNoise) {
    responseTitle = "[답변] 생활소음 및 층간 불편에 따른 현장 점검 및 조치사항 안내";
    if (extractedKeywords.length === 0) extractedKeywords = ["생활소음", "공동주택관리법", "소음측정", "자율중재"];
    if (includeLaw) {
      relevantLaws.push({
        lawName: "소음·진동관리법",
        article: "제21조 (생활소음과 진동의 규제)",
        description: "주민의 조용하고 평온한 생활환경을 유지하기 위해 공사장 및 사업장 등의 소음 기준 초과 시 행정처분."
      });
      relevantLaws.push({
        lawName: "공동주택관리법",
        article: "제20조 (층간소음의 방지 등)",
        description: "입주자간 분쟁 완화를 위한 관리주체의 사실확인 및 중재 안내 규정."
      });
    }
    threeLineSummary = [
      "소음 발생으로 인한 거주민의 일상 피해 호소 확인",
      "소음·진동관리법 및 세부 규정에 따른 현장 소음 기준치 점검",
      "관리주체 및 발생원에 대한 행정지도와 자율 조정 방안 권고"
    ];
  } else if (isWaste) {
    responseTitle = "[답변] 무단투기 쓰레기 수거 및 쾌적한 가로환경 정비 결과 안내";
    if (extractedKeywords.length === 0) extractedKeywords = ["무단투기", "폐기물관리법", "기동수거", "CCTV감시"];
    if (includeLaw) {
      relevantLaws.push({
        lawName: "폐기물관리법",
        article: "제8조 (폐기물의 투기 금지 등)",
        description: "누구든지 특별자치시장·특별자치도지사·시장·군수·구청장이 지정하는 장소 외의 장소에 폐기물을 버려서는 아니 됨."
      });
    }
    threeLineSummary = [
      "방치 쓰레기 및 악취 발생에 대한 현장 적치 실태 확인",
      "기동청소반 긴급 투입을 통한 즉시 수거 및 방역 소독 완료",
      "무단투기 방지 이동식 감시카메라 배치 및 경고판 보강"
    ];
  } else if (isPothole) {
    responseTitle = "[답변] 도로 파손(포트홀) 및 공공시설 긴급 보수 처리결과 안내";
    if (extractedKeywords.length === 0) extractedKeywords = ["도로보수", "포트홀정비", "안전사고예방", "시설물관리"];
    if (includeLaw) {
      relevantLaws.push({
        lawName: "도로법",
        article: "제31조 (도로의 유지·관리)",
        description: "도로관리청은 도로를 안전하고 원활하게 유지 관리하기 위하여 유지·보수 조치를 취하여야 함."
      });
    }
    threeLineSummary = [
      "차량 파손 및 보행자 안전사고 위험을 초래하는 도로 파손 확인",
      "도로유지관리 긴급복구반 현장 출동 및 아스콘 응급 복구 조치",
      "동일 노선에 대한 추가 노면 균열 점검 및 재포장 일정 반영"
    ];
  } else if (isMalicious) {
    responseTitle = "[안내] 관련 법령 및 규정에 따른 민원 처리결과 공식 통지";
    if (extractedKeywords.length === 0) extractedKeywords = ["반복민원종결", "민원처리법", "산업안전보건법", "원칙대응"];
    if (includeLaw) {
      relevantLaws = [
        {
          lawName: "민원 처리에 관한 법률",
          article: "제23조 (반복 및 중복 민원의 처리)",
          description: "정당한 사유 없이 3회 이상 반복 제출된 동일 민원은 2회 이상 처리결과 통지 후 결재를 받아 종결 처리 가능."
        },
        {
          lawName: "산업안전보건법",
          article: "제41조 (고객응대근로자의 건강장해 예방조치)",
          description: "고객의 폭언, 폭행, 고성방가 등으로부터 담당 공무원 및 상담원을 보호하기 위한 조치 시행 의무."
        }
      ];
    }
    threeLineSummary = [
      "기회신 완료된 사안에 대한 지속적 이의 제기 사항 검토",
      "새로운 증빙자료 부존재 및 현행 법령 기준 초과 수용 불가 확인",
      "민원 처리에 관한 법률 제23조에 의거한 공식 종결 절차 안내"
    ];
  }

  // Response text formatting
  let generatedResponse = "";
  const customDirectiveText = customDirectives.trim()
    ? `\n\n[추가 특이사항 안내]: ${customDirectives.trim()}`
    : "";

  if (channel === "sms_notice") {
    if (tone === "firm") {
      generatedResponse = `[${department} 공식 안내]
귀하께서 제기하신 민원에 대하여 검토 결과를 안내드립니다.
본 민원은 이미 관계 법령에 의거하여 공식 답변을 통지해 드린 사안으로, 현행 법적 기준상 추가 조치가 불가합니다.
'민원 처리에 관한 법률' 제23조에 따라 종결 처리됨을 양해 바라며, 지속적인 폭언 등은 공직자 보호 규정에 의해 제재될 수 있습니다.
- 문의: ${department} (${officerName})${customDirectiveText}`;
    } else if (tone === "empathy") {
      generatedResponse = `[${department} 처리 알림]
귀하의 일상에 큰 불편을 끼쳐드려 매우 송구스럽습니다.
보내주신 소중한 민원은 담당자가 현장을 직접 확인하였으며, 지적해주신 문제점을 개선하기 위해 즉시 행정 조치를 진행 중에 있습니다.
조속히 해결될 수 있도록 꼼꼼히 챙기겠습니다.
- 문의: ${department} 담당자 ${officerName}${customDirectiveText}`;
    } else {
      generatedResponse = `[${department} 민원 처리 알림]
귀하께서 접수하신 민원에 대한 처리결과를 안내드립니다.
소관 부서에서 현장 확인을 마쳤으며, 관계 지침에 따라 신속한 계도 및 시설 정비 조치를 완료/예정하고 있습니다.
상세한 내역은 정부24 또는 관할 기관 포털에서 확인하실 수 있습니다.
- 문의: ${department} (${officerName})${customDirectiveText}`;
    }
  } else if (channel === "phone_script") {
    if (tone === "firm") {
      generatedResponse = `[전화 상담 스크립트 - 단호·원칙 대응형]

(도입)
"안녕하십니까, 선생님. ${department} ${officerName}입니다. 접수해주신 민원 사안과 관련하여 기관의 공식 검토 기준을 안내드리고자 연락드렸습니다."

(원칙 설명 및 규정 고지)
"선생님께서 여러 차례 말씀해 주신 불편 사항의 취지는 충분히 인지하고 있습니다. 다만, 우리 기관은 관계 법령과 객관적 행정 기준에 입각하여 모든 민원을 공평하게 처리해야 할 법적 책무가 있습니다. 본 사안은 이미 적법한 절차를 거쳐 2차례 이상 처리 결과를 안내해 드린 바 있으며, 현재로서는 법적 근거가 부존재하여 추가 수용이 어렵습니다."

(공직자 보호 안내 및 경고)
"아울러 선생님, 산업안전보건법 제41조 및 민원 처리 담당자 보호 규정에 의거하여 통화 중 과도한 고성이나 폭언, 비하 발언을 지속하실 경우 통화가 부득이하게 종료될 수 있음을 안내드립니다. 성숙한 소통을 부탁드립니다."

(종결)
"동일한 내용에 대한 반복 안내는 행정력 낭비를 방지하기 위해 더 이상 진행하기 어려움을 혜량하여 주시기 바랍니다. 이만 통화를 종료하겠습니다. 감사합니다."${customDirectiveText}`;
    } else if (tone === "empathy") {
      generatedResponse = `[전화 상담 스크립트 - 친절·공감형]

(도입)
"안녕하십니까, 선생님! ${department} 민원 담당자 ${officerName}입니다. 보내주신 민원 내용을 전해 듣고 연락드렸습니다."

(공감 및 경청 쿠션어)
"그동안 매일같이 얼마나 신경 쓰이고 답답하셨습니까. 생활하시는 공간에서 이런 불편을 겪으셨으니 저라도 크게 힘드셨을 것 같습니다. 바로 개선해 드리지 못해 담당자로서 송구한 마음입니다."

(본론 안내 및 조치 계획)
"선생님께서 말씀해 주신 현장에 제가 직접 나가서 상황을 면밀히 확인해 보았습니다. 우선 당장 조치할 수 있는 계도 및 현장 정비를 1차적으로 조치하였으며, 앞으로도 재발하지 않도록 순찰 횟수를 주 2회 이상 늘려 관리할 계획입니다."

(클로징)
"선생님의 소중한 제보 덕분에 우리 동네가 더 살기 좋은 환경으로 가꿔지고 있습니다. 혹시라도 앞으로 미흡한 점이 발견되면 언제든 제 직통 번호로 편하게 연락 주십시오. 환절기 건강 유의하십시오!"${customDirectiveText}`;
    } else {
      generatedResponse = `[전화 상담 스크립트 - 표준·신중형]

(도입)
"안녕하십니까. ${department} 민원담당관 ${officerName}입니다. 접수하신 민원에 대한 검토 결과를 안내해 드리고자 연락드렸습니다."

(본론 안내)
"귀하께서 제기해 주신 내용에 대하여 소관 부서에서는 관계 법령 및 현장 운영 지침을 바탕으로 다각적인 검토를 진행하였습니다. 검토 결과, 지적하신 부분에 대해 즉각적인 행정 지도와 함께 시정 명령 조치를 취하였습니다."

(클로징)
"공식 처리 결과 문서는 금일 중 시스템을 통해 서면으로도 등록해 드릴 예정입니다. 추가적인 문의나 설명이 필요하시면 언제든 담당 부서로 연락해 주시기 바랍니다. 감사합니다."${customDirectiveText}`;
    }
  } else {
    // Official Letter
    if (tone === "firm") {
      generatedResponse = `1. 귀하의 무궁한 발전을 기원합니다.

2. 귀하께서 우리 기관에 제기하신 민원(접수번호: 2026-민원-제00호)에 대한 법적 검토 결과를 다음과 같이 엄정히 회신합니다.

가. 민원 요지
  - 기존에 수차례 회신 통보된 동일 사안에 대한 지속적인 민원 제기 및 법적 기준을 초과하는 행정처분 요구

나. 법적 근거 및 검토 결과
  - 「민원 처리에 관한 법률」 제23조(반복 및 중복 민원의 처리)에 의거하여, 행정기관은 정당한 사유 없이 3회 이상 반복 제출된 동일 내용의 민원에 대하여 2회 이상 그 처리결과를 통지한 경우 그 후에 접수되는 민원은 종결 처리할 수 있습니다.
  - 귀하께서 제기하신 사안은 이미 2회에 걸쳐 적법한 법령 해석과 소관 부서의 현장 조사 결과를 바탕으로 명확한 처리 방침을 회신해 드린 바 있습니다.
  - 현재 시점에서도 새로운 사실관계나 객관적인 법적 증빙이 제출되지 않았으므로, 기존의 적법한 행정 판단을 변경할 법률적 사유가 부존재합니다.

다. 향후 조치 및 당부 사항
  - 이에 따라 본 민원은 「민원 처리에 관한 법률」 제23조에 의거하여 종결 처리됨을 공식 통지합니다.
  - 아울러, 담당 공무원에 대한 지속적인 비방, 고성, 업무방해 행위는 「산업안전보건법」 제41조 및 형법상 공무집행방해 규정에 의해 엄정 대응될 수 있음을 안내드립니다.

3. 공정하고 투명한 공공 행정 질서 확립을 위한 귀하의 이해와 협조를 당부드립니다. 끝.${customDirectiveText}

담당부서: ${department}
담당자: ${officerName}
문의전화: 02-120 (내선 직통)`;
    } else if (tone === "empathy") {
      generatedResponse = `1. 평소 우리 기관의 행정 발전에 따뜻한 관심을 보내주시는 귀하께 깊은 감사를 드리며, 귀하의 가정에 늘 평안과 행복이 가득하시기를 기원합니다.

2. 귀하께서 접수해 주신 민원(접수번호: 2026-민원-제00호)의 취지는 "일상 생활 속 극심한 불편을 야기하는 현장 환경 개선 및 신속한 행정 지도 요청"으로 파악되었습니다. 겪으셨을 심리적 고통과 생활 속 불편에 깊이 공감하며, 신속히 해결해 드리지 못해 송구스럽게 생각합니다.

3. 접수된 민원 사항에 대하여 소관 부서 담당자가 현장을 확인하고 종합적으로 검토한 결과는 다음과 같습니다.

가. 현장 사실 확인
  - 현장 방문 점검 결과 귀하께서 지적해주신 불편 사항이 다수 발생하고 있음을 확인하였습니다.

나. 행정 조치 내역
  - 관계인(소유자/관리주체)에 대하여 현장 계도 및 즉각적인 자율 시정을 권고하였습니다.
  - 신속한 개선이 이루어질 수 있도록 주기적인 현장 모니터링을 병행하겠습니다.

다. 향후 개선 및 관리 계획
  - 일회성 점검에 그치지 않고 주 2회 이상 관할 구역에 대한 불시 순찰을 지속하여 주민 여러분의 생활 안전을 지키겠습니다.

4. 행정 절차상 법령 기준과 현장 조율 과정에서 다소 시일이 소요될 수 있음을 널리 혜량하여 주시기 바라며, 추가적인 의문이나 진행 상황에 대해 궁금하신 점이 있으시면 언제든지 아래 담당자에게 연락 주시기 바랍니다. 성심을 다해 안내해 드리겠습니다. 끝.${customDirectiveText}

담당부서: ${department}
담당자: ${officerName}
전화번호: 02-120 (평일 09:00~18:00)`;
    } else {
      generatedResponse = `1. 귀하의 가정에 건강과 평안이 함께하시기를 기원합니다.

2. 우리 기관에 접수된 귀하의 민원(접수번호: 2026-민원-제00호)에 대하여 다음과 같이 처리 결과를 회신합니다.

가. 민원 요지
  - 관할 구역 내 불편 사항 개선 및 관련 법령에 따른 신속한 행정 지도 요청

나. 검토 및 사실 확인 내용
  - 관련 법령: 「민원 처리에 관한 법률」 및 해당 업무 세부 운영 지침
  - 소관 부서에서는 접수된 내용을 토대로 현장 확인 및 관계 규정 저촉 여부를 종합적으로 검토하였습니다.
  - 검토 결과, 현행 기준에 따라 계도 조치 및 시정 명령을 통보하였으며, 미이행 시 관련 규정에 따른 행정 처분을 진행할 예정입니다.

다. 향후 처리 계획
  - 향후 유사한 불편이 재발하지 않도록 관할 구역에 대한 지속적인 순찰 및 점검을 강화해 나가겠습니다.

3. 시정에 대한 관심에 다시 한번 감사드리며, 본 답변과 관련하여 추가 설명이 필요하신 경우 아래 담당자에게 연락 주시면 성실히 안내해 드리겠습니다. 끝.${customDirectiveText}

담당부서: ${department}
담당자: ${officerName}
전화번호: 02-120`;
    }
  }

  const communicationTips = [
    tone === "firm"
      ? "악성·반복 민원 응대 시에는 감정적 대립을 피하고 법적 근거 조항과 공직자 보호 지침을 객관적으로 안내하세요."
      : tone === "empathy"
      ? "민원인의 불편에 대한 진심 어린 공감과 경청 쿠션어를 서두에 배치하여 방어기제를 완화하세요."
      : "객관적인 사실 확인 결과와 향후 행정 조치 계획을 기한과 함께 명확히 제시하세요.",
    "민원인의 감정을 자극하는 방어적 어휘('저희 소관이 아닙니다', '어쩔 수 없습니다')를 지양하세요.",
    "처리 기한과 차후 현장 점검 일정을 구체적인 날짜나 주기로 제시하면 신뢰도가 대폭 향상됩니다."
  ];

  const alternativeExpressions = [
    {
      original: "그건 저희 부서 업무가 아니라서 해드릴 수 없습니다.",
      suggested: "해당 사안은 소관 전문 부서(OO과)의 면밀한 검토가 필요하여 신속히 이첩 안내해 드리겠습니다.",
      reason: "책임 회피 인상을 주지 않고 적극적인 행정 지원 태도 전달"
    },
    {
      original: "규정상 절대 불가능합니다.",
      suggested: "현행 관련 법령의 적용 기준상 즉각적인 수용에는 법률적 한계가 있음을 널리 혜량하여 주시기 바랍니다.",
      reason: "단정적인 거절 대신 객관적 규정의 한계 설명"
    },
    {
      original: "왜 자꾸 전화하십니까?",
      suggested: "선생님께서 걱정하시는 취지는 충분히 알고 있으나, 기 통보해 드린 방침 외 추가 변경 사항이 없음을 정중히 말씀드립니다.",
      reason: "민원인의 공격적 태도에 말려들지 않고 원칙 중심 대화 유지"
    }
  ];

  return {
    threeLineSummary,
    extractedKeywords,
    responseTitle,
    generatedResponse,
    relevantLaws,
    communicationTips,
    alternativeExpressions,
    timestamp: new Date().toISOString()
  };
}
