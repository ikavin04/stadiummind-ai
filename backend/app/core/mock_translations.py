"""
Mock offline translations for StadiumMind AI.
Provides translations for the 24 seeded knowledge chunks and standard chatbot UI phrases
in Spanish, French, Portuguese, Hindi, and Arabic.
"""

TRANSLATION_DICT = {
    "Spanish": {
        # UI & System Messages
        "Based on our stadium info:": "Según la información de nuestro estadio:",
        "Additionally:": "Además:",
        "I don't have that information available right now. Please check with a volunteer or visit Fan Services at Gate B — they're wearing bright orange vests and will be happy to help! 🏟️": 
            "No tengo esa información disponible en este momento. Por favor, consulte con un voluntario o con Servicios al Fanático en la Puerta B — llevan chalecos naranjas y estarán encantados de ayudarle. 🏟️",
        "I don't have specific information on that. For anything not covered here, please check with a volunteer or Fan Services at Gate B — they'll be happy to help! 🏟️": 
            "No tengo información específica sobre eso. Para cualquier cosa que no esté cubierta aquí, consulte con un voluntario o con Servicios al Fanático en la Puerta B. ¡Estarán encantados de ayudarle! 🏟️",
        
        # Knowledge Chunks
        "MetLife Stadium has four main entrances: Gate A (South), Gate B (North), Gate C (East), and Gate D (West). Each gate has dedicated ticket scanning lanes. Gates open 2.5 hours before kickoff.":
            "El estadio MetLife tiene cuatro entradas principales: Puerta A (Sur), Puerta B (Norte), Puerta C (Este) y Puerta D (Oeste). Cada puerta tiene carriles dedicados para el escaneo de boletos. Las puertas se abren 2.5 horas antes del partido.",
        
        "Restrooms are located at every gate entrance and at 50-meter intervals along each concourse. Accessible restrooms with baby-changing facilities are available at the North and South Concourse hubs.":
            "Los baños se encuentran en cada entrada y a intervalos de 50 metros a lo largo de cada vestíbulo. Los baños accesibles con cambiadores para bebés están disponibles en los centros de los vestíbulos Norte y Sur.",
        
        "The Medical Center is located near Gate A on Level 1. It is staffed by paramedics and doctors throughout the event. For emergencies, call the stadium emergency line or approach any orange-vested volunteer.":
            "El Centro Médico se encuentra cerca de la Puerta A en el Nivel 1. Cuenta con la asistencia de médicos y paramédicos durante todo el evento. Para emergencias, llame a la línea de emergencia del estadio o diríjase a cualquier voluntario con chaleco naranja.",
        
        "Lost and Found is located at the Fan Services desk near Gate B. If you lose an item during the match, report it during the event or within 24 hours after. Items are kept for 30 days.":
            "La oficina de Objetos Perdidos se encuentra en el mostrador de Servicios al Fanático cerca de la Puerta B. Si pierde un objeto durante el partido, infórmelo durante el evento o dentro de las 24 horas posteriores. Los objetos se conservan durante 30 días.",
        
        "Baby-changing stations and family restrooms are available on Level 1 near Sections 101 and 115, and on Level 2 near Section 212.":
            "Los cambiadores para bebés y los baños familiares están disponibles en el Nivel 1 cerca de las Secciones 101 y 115, y en el Nivel 2 cerca de la Sección 212.",
        
        "Seating sections are divided into three levels: Lower Bowl (Sections 100–150), Club Level (Sections 200–250), and Upper Bowl (Sections 300–350). Each section number corresponds to a specific area of the stadium. The first digit indicates the level.":
            "Las secciones de asientos se dividen en tres niveles: Grada Baja (Secciones 100-150), Nivel Club (Secciones 200-250) y Grada Alta (Secciones 300-350). Cada número de sección corresponde a un área específica del estadio. El primer dígito indica el nivel.",
        
        "If you cannot find your seat, look for the section number printed on the nearest column or overhead sign. Ushers in yellow vests are stationed at every section entrance and can direct you to your specific row and seat.":
            "Si no encuentra su asiento, busque el número de sección impreso en la columna o cartel superior más cercano. Hay acomodadores con chalecos amarillos en cada entrada de sección que pueden guiarle a su fila y asiento específicos.",
        
        "Accessible seating areas are located in Sections 103, 125, 203, 225, 303, and 325. Companion seating is available adjacent to each accessible position. Contact Fan Services at Gate B for assistance.":
            "Las áreas de asientos accesibles se encuentran en las Secciones 103, 125, 203, 225, 303 y 325. Los asientos para acompañantes están disponibles junto a cada posición accesible. Póngase en contacto con Servicios al Fanático en la Puerta B para obtener ayuda.",
        
        "Food Court on Level 1 features 24 vendors including international cuisine representing all 32 World Cup nations. Open 3 hours before kickoff until 1 hour after the final whistle. Cashless payment only — all major cards and mobile payments accepted.":
            "El Patio de Comidas en el Nivel 1 cuenta con 24 vendedores que incluyen cocina internacional que representa a las 32 naciones de la Copa del Mundo. Abierto desde 3 horas antes del partido hasta 1 hora después del silbato final. Solo pago sin efectivo.",
        
        "Concession stands on every concourse level offer hot dogs, burgers, pizza, nachos, pretzels, and non-alcoholic beverages. Specialty stands offer halal, kosher, vegetarian, and vegan options — look for the colored flag icons above each stand.":
            "Los puestos de comida en cada nivel del vestíbulo ofrecen hot dogs, hamburguesas, pizza, nachos, pretzels y bebidas no alcohólicas. Los puestos de especialidades ofrecen opciones halal, kosher, vegetarianas y veganas; busque los íconos de banderas de colores arriba de cada puesto.",
        
        "Alcoholic beverages are available at designated areas on Level 1 and Level 2 for fans aged 21+ with valid ID. Alcohol service stops at 15 minutes before the end of the second half.":
            "Las bebidas alcohólicas están disponibles en áreas designadas en el Nivel 1 y Nivel 2 para fanáticos mayores de 21 años con identificación válida. El servicio de alcohol se detiene 15 minutos antes del final del segundo tiempo.",
        
        "Outside food and beverages are not permitted inside the stadium. One factory-sealed water bottle (up to 1 liter) per person is allowed. No outside alcohol is permitted under any circumstances.":
            "No se permiten alimentos ni bebidas del exterior dentro del estadio. Se permite una botella de agua sellada de fábrica (hasta 1 litro) por persona. No se permite alcohol del exterior bajo ninguna circunstancia.",
        
        "Parking Lot A is the official FIFA World Cup parking area adjacent to the stadium. Capacity is 5,000 vehicles. Pre-purchase parking passes online — no cash parking on match day. Gates open 4 hours before kickoff.":
            "El Estacionamiento A es el área de estacionamiento oficial de la Copa Mundial de la FIFA adyacente al estadio. La capacidad es de 5,000 vehículos. Compre los pases de estacionamiento en línea; no hay pago en efectivo el día del partido. Abre 4 horas antes del partido.",
        
        "Public transportation is strongly recommended. NJ Transit operates dedicated express trains to MetLife Stadium from Penn Station (New York) and Secaucus Junction, starting 3 hours before kickoff. No additional ticket required beyond the train fare.":
            "Se recomienda encarecidamente el transporte público. NJ Transit opera trenes expresos dedicados al MetLife Stadium desde Penn Station (Nueva York) y Secaucus Junction, comenzando 3 horas antes del partido. No se requiere boleto adicional.",
        
        "Ride-share drop-off and pick-up is designated in Lot B (Yellow Zone). Follow the blue signs from the main road. Expect 20-45 minute waits after the match — consider waiting 30 minutes inside before heading to the pick-up zone.":
            "El punto de encuentro para viajes compartidos está designado en el Lote B (Zona Amarilla). Siga las señales azules. Espere de 20 a 45 minutos de espera después del partido; considere esperar 30 minutos adentro antes de dirigirse a la zona de recogida.",
        
        "FIFA World Cup 2026 matches at MetLife Stadium: Kickoff times are typically 15:00, 18:00, or 21:00 local time. The stadium schedule is updated daily and displayed on the large screens at each entrance.":
            "Partidos de la Copa Mundial de la FIFA 2026 en el MetLife Stadium: los horarios de inicio suelen ser a las 15:00, 18:00 o 21:00 hora local. El calendario se actualiza diariamente y se muestra en las pantallas grandes de cada entrada.",
        
        "Half-time lasts 15 minutes. Extra time (if applicable) adds two 15-minute periods. Penalty shootouts follow if scores are level after extra time in knockout rounds. Match duration including stoppages averages 100-110 minutes.":
            "El entretiempo dura 15 minutos. El tiempo extra (si corresponde) agrega dos períodos de 15 minutos. Los penales siguen si los puntajes están empatados después del tiempo extra en las rondas eliminatorias. La duración promedio es de 100 a 110 minutos.",
        
        "Stadium gates open 2.5 hours before kickoff. The pre-match show begins 45 minutes before kickoff. Fan zones outside the stadium open 4 hours before kickoff with live music, food trucks, and interactive experiences.":
            "Las puertas del estadio se abren 2.5 horas antes del partido. El espectáculo previo comienza 45 minutos antes. Las zonas de fanáticos fuera del estadio abren 4 horas antes con música en vivo y camiones de comida.",
        
        "Prohibited items include: professional cameras with detachable lenses, tripods, laser pointers, flares, fireworks, drones, weapons, large bags (over 12x6x12 inches), and noise-making devices other than vuvuzelas (limited).":
            "Los artículos prohibidos incluyen: cámaras profesionales con lentes desmontables, trípodes, punteros láser, bengalas, fuegos artificiales, drones, armas, bolsos grandes y dispositivos para hacer ruido que no sean vuvuzelas.",
        
        "FIFA's Code of Conduct applies at all times. Racist, discriminatory, or offensive behavior will result in immediate ejection from the stadium without refund, and potential legal action. Report incidents to the nearest security officer or call the fan incident hotline.":
            "El Código de Conducta de la FIFA se aplica en todo momento. El comportamiento racista, discriminatorio u ofensivo resultará en la expulsión inmediata. Informe los incidentes al oficial de seguridad más cercano.",
        
        "Bags larger than 12x6x12 inches are not permitted. Clear bags are recommended for faster security screening. Stadium security screening opens 2.5 hours before kickoff. Walk-through metal detectors and bag X-ray machines are in use at all gates.":
            "No se permiten bolsos de más de 12x6x12 pulgadas. Se recomiendan bolsos transparentes para un control más rápido. El control de seguridad se abre 2.5 horas antes. Detectores de metales y máquinas de rayos X están en uso.",
        
        "Photography and video recording for personal use is permitted throughout the match. Commercial photography and broadcasting require FIFA-issued credentials. Selfie sticks are allowed but must not obstruct the view of other fans.":
            "Se permite la fotografía y grabación de video para uso personal. La fotografía comercial requiere credenciales de la FIFA. Se permiten los palos para selfies pero no deben obstruir la vista de otros fanáticos.",
        
        "To navigate between levels: escalators and elevators are located at Gate A (Level 1-3), Gate B (Level 1-3), the North Concourse Hub (Level 1-3), and the South Concourse Hub (Level 1-3). Stairwells are at every gate and section entrance.":
            "Para navegar entre niveles: escaleras mecánicas y ascensores se encuentran en la Puerta A, Puerta B y los centros de vestíbulos Norte y Sur. Las escaleras están en cada puerta y entrada de sección.",
        
        "If you are approaching from Parking Lot A or the NJ Transit Station, follow the green pathway signs to Gate A or Gate B. Fans from the bus drop-off zone should follow orange pathway signs to Gate C or Gate D.":
            "Si se acerca desde el Estacionamiento A o la Estación NJ Transit, siga las señales verdes hacia la Puerta A o B. Los fanáticos del autobús deben seguir las señales naranjas hacia la Puerta C o D.",
    },
    "French": {
        # UI & System Messages
        "Based on our stadium info:": "Selon les informations de notre stade :",
        "Additionally:": "De plus :",
        "I don't have that information available right now. Please check with a volunteer or visit Fan Services at Gate B — they're wearing bright orange vests and will be happy to help! 🏟️":
            "Je n'ai pas cette information pour le moment. Veuillez vous adresser à un bénévole ou aux Services aux Supporters à la Porte B — ils portent des gilets orange et seront ravis de vous aider. 🏟️",
        "I don't have specific information on that. For anything not covered here, please check with a volunteer or Fan Services at Gate B — they'll be happy to help! 🏟️":
            "Je n'ai pas d'informations spécifiques à ce sujet. Pour tout ce qui n'est pas couvert ici, veuillez vous adresser à un bénévole ou aux Services aux Supporters à la Porte B - ils se feront un plaisir de vous aider ! 🏟️",
            
        # Knowledge Chunks (Concise Translations)
        "MetLife Stadium has four main entrances: Gate A (South), Gate B (North), Gate C (East), and Gate D (West). Each gate has dedicated ticket scanning lanes. Gates open 2.5 hours before kickoff.":
            "Le stade MetLife dispose de quatre entrées principales : Porte A (Sud), Porte B (Nord), Porte C (Est) et Porte D (Ouest). Les portes ouvrent 2,5 heures avant le coup d'envoi.",
        "Restrooms are located at every gate entrance and at 50-meter intervals along each concourse. Accessible restrooms with baby-changing facilities are available at the North and South Concourse hubs.":
            "Des toilettes se trouvent à chaque entrée et tous les 50 mètres le long des tribunes. Des toilettes accessibles avec table à langer sont disponibles aux hubs Nord et Sud.",
        "The Medical Center is located near Gate A on Level 1. It is staffed by paramedics and doctors throughout the event. For emergencies, call the stadium emergency line or approach any orange-vested volunteer.":
            "Le centre médical est situé près de la Porte A au niveau 1. Des médecins et secouristes sont présents. En cas d'urgence, contactez un bénévole en gilet orange.",
        "Lost and Found is located at the Fan Services desk near Gate B. If you lose an item during the match, report it during the event or within 24 hours after. Items are kept for 30 days.":
            "Les objets trouvés sont au bureau des Services aux Supporters à la Porte B. Signalez les pertes durant l'événement ou dans les 24 heures. Objets conservés 30 jours.",
        "Baby-changing stations and family restrooms are available on Level 1 near Sections 101 and 115, and on Level 2 near Section 212.":
            "Des tables à langer et toilettes familiales sont disponibles au Niveau 1 (Secteurs 101 et 115) et au Niveau 2 (Secteur 212).",
        "Seating sections are divided into three levels: Lower Bowl (Sections 100–150), Club Level (Sections 200–250), and Upper Bowl (Sections 300–350). Each section number corresponds to a specific area of the stadium. The first digit indicates the level.":
            "Les places sont divisées en trois niveaux : Tribune Basse (100-150), Niveau Club (200-250) et Tribune Haute (300-350). Le premier chiffre indique le niveau.",
        "If you cannot find your seat, look for the section number printed on the nearest column or overhead sign. Ushers in yellow vests are stationed at every section entrance and can direct you to your specific row and seat.":
            "Si vous ne trouvez pas votre place, cherchez le numéro de secteur sur les colonnes. Des placeurs en gilet jaune sont présents à chaque entrée pour vous guider.",
        "Accessible seating areas are located in Sections 103, 125, 203, 225, 303, and 325. Companion seating is available adjacent to each accessible position. Contact Fan Services at Gate B for assistance.":
            "Des places accessibles sont dans les Secteurs 103, 125, 203, 225, 303 et 325. Des places d'accompagnement sont adjacentes. Contactez le service clients Porte B.",
        "Food Court on Level 1 features 24 vendors including international cuisine representing all 32 World Cup nations. Open 3 hours before kickoff until 1 hour after the final whistle. Cashless payment only — all major cards and mobile payments accepted.":
            "Le Food Court au Niveau 1 propose 24 stands de cuisine internationale. Ouvert de 3h avant le match à 1h après. Paiements sans contact uniquement.",
        "Concession stands on every concourse level offer hot dogs, burgers, pizza, nachos, pretzels, and non-alcoholic beverages. Specialty stands offer halal, kosher, vegetarian, and vegan options — look for the colored flag icons above each stand.":
            "Les buvettes proposent hot-dogs, burgers, pizzas, snacks et boissons softs. Des options halal, cascher, végétariennes et végétaliennes sont indiquées par des drapeaux.",
        "Alcoholic beverages are available at designated areas on Level 1 and Level 2 for fans aged 21+ with valid ID. Alcohol service stops at 15 minutes before the end of the second half.":
            "Des boissons alcoolisées sont vendues Niveaux 1 et 2 aux personnes de plus de 21 ans avec pièce d'identité. Le service s'arrête 15 min avant la fin du match.",
        "Outside food and beverages are not permitted inside the stadium. One factory-sealed water bottle (up to 1 liter) per person is allowed. No outside alcohol is permitted under any circumstances.":
            "Boissons et nourriture extérieures interdites. Une bouteille d'eau scellée (1L max) autorisée par personne. Aucun alcool extérieur autorisé.",
        "Parking Lot A is the official FIFA World Cup parking area adjacent to the stadium. Capacity is 5,000 vehicles. Pre-purchase parking passes online — no cash parking on match day. Gates open 4 hours before kickoff.":
            "Le parking A est le parking officiel FIFA attenant au stade (5000 places). Achat des pass en ligne obligatoire. Ouverture 4h avant le match.",
        "Public transportation is strongly recommended. NJ Transit operates dedicated express trains to MetLife Stadium from Penn Station (New York) and Secaucus Junction, starting 3 hours before kickoff. No additional ticket required beyond the train fare.":
            "Transports en commun vivement recommandés. Trains express NJ Transit depuis Penn Station (NY) et Secaucus 3h avant le match. Billet de train standard requis.",
        "Ride-share drop-off and pick-up is designated in Lot B (Yellow Zone). Follow the blue signs from the main road. Expect 20-45 minute waits after the match — consider waiting 30 minutes inside before heading to the pick-up zone.":
            "Dépose et reprise VTC au Parking B (Zone Jaune). Suivez les panneaux bleus. Attente de 20-45 min après le match. Attendez au moins 30 min à l'intérieur.",
        "FIFA World Cup 2026 matches at MetLife Stadium: Kickoff times are typically 15:00, 18:00, or 21:00 local time. The stadium schedule is updated daily and displayed on the large screens at each entrance.":
            "Matchs de la Coupe du Monde 2026 : Coups d'envoi à 15h, 18h ou 21h heure locale. Le planning quotidien est affiché sur les écrans géants aux entrées.",
        "Half-time lasts 15 minutes. Extra time (if applicable) adds two 15-minute periods. Penalty shootouts follow if scores are level after extra time in knockout rounds. Match duration including stoppages averages 100-110 minutes.":
            "Mi-temps de 15 min. Prolongations (si applicable) de 2x15 min, puis tirs au but. La durée totale moyenne avec arrêts de jeu est de 100-110 min.",
        "Stadium gates open 2.5 hours before kickoff. The pre-match show begins 45 minutes before kickoff. Fan zones outside the stadium open 4 hours before kickoff with live music, food trucks, and interactive experiences.":
            "Ouverture des portes 2h30 avant. Show d'avant-match 45 min avant. Fan zones extérieures ouvertes 4h avant avec musique et food-trucks.",
        "Prohibited items include: professional cameras with detachable lenses, tripods, laser pointers, flares, fireworks, drones, weapons, large bags (over 12x6x12 inches), and noise-making devices other than vuvuzelas (limited).":
            "Objets interdits : caméras pro, trépieds, lasers, fumigènes, drones, armes, sacs volumineux, appareils bruyants (hors vuvuzelas autorisées).",
        "FIFA's Code of Conduct applies at all times. Racist, discriminatory, or offensive behavior will result in immediate ejection from the stadium without refund, and potential legal action. Report incidents to the nearest security officer or call the fan incident hotline.":
            "Le Code de conduite FIFA s'applique. Tout comportement raciste ou discriminant entraîne l'expulsion immédiate du stade. Signalez aux agents de sécurité.",
        "Bags larger than 12x6x12 inches are not permitted. Clear bags are recommended for faster security screening. Stadium security screening opens 2.5 hours before kickoff. Walk-through metal detectors and bag X-ray machines are in use at all gates.":
            "Sacs de plus de 12x6x12 pouces interdits. Sacs transparents conseillés. Contrôles de sécurité 2h30 avant avec portiques de sécurité.",
        "Photography and video recording for personal use is permitted throughout the match. Commercial photography and broadcasting require FIFA-issued credentials. Selfie sticks are allowed but must not obstruct the view of other fans.":
            "Photos et vidéos pour usage personnel autorisées. Photos pro et diffusion nécessitent des accréditations. Perches à selfie admises si non gênantes.",
        "To navigate between levels: escalators and elevators are located at Gate A (Level 1-3), Gate B (Level 1-3), the North Concourse Hub (Level 1-3), and the South Concourse Hub (Level 1-3). Stairwells are at every gate and section entrance.":
            "Changement de niveau : escalators et ascenseurs aux Portes A, B et hubs Nord et Sud. Escaliers disponibles à chaque porte et entrée de secteur.",
        "If you are approaching from Parking Lot A or the NJ Transit Station, follow the green pathway signs to Gate A or Gate B. Fans from the bus drop-off zone should follow orange pathway signs to Gate C or Gate D.":
            "Depuis le parking A ou la gare NJ Transit, suivez les flèches vertes vers Portes A/B. Depuis le dépose-bus, suivez les flèches oranges vers Portes C/D.",
    },
    "Portuguese": {
        # UI & System Messages
        "Based on our stadium info:": "Com base nas informações do nosso estádio:",
        "Additionally:": "Além disso:",
        "I don't have that information available right now. Please check with a volunteer or visit Fan Services at Gate B — they're wearing bright orange vests and will be happy to help! 🏟️":
            "Não tenho essa informação disponível agora. Por favor, procure um voluntário ou os Serviços aos Torcedores no Portão B — eles usam coletes laranja e terão prazer em ajudar. 🏟️",
        "I don't have specific information on that. For anything not covered here, please check with a volunteer or Fan Services at Gate B — they'll be happy to help! 🏟️":
            "Não tenho informações específicas sobre isso. Para qualquer coisa não abordada aqui, por favor, verifique com um voluntário ou com os Serviços aos Torcedores no Portão B — eles ficarão felizes em ajudar! 🏟️",
            
        # Knowledge Chunks (Concise Translations)
        "MetLife Stadium has four main entrances: Gate A (South), Gate B (North), Gate C (East), and Gate D (West). Each gate has dedicated ticket scanning lanes. Gates open 2.5 hours before kickoff.":
            "O MetLife Stadium tem quatro entradas principais: Portão A (Sul), Portão B (Norte), Portão C (Leste) e Portão D (Oeste). Portões abrem 2,5 horas antes.",
        "Restrooms are located at every gate entrance and at 50-meter intervals along each concourse. Accessible restrooms with baby-changing facilities are available at the North and South Concourse hubs.":
            "Banheiros ficam em cada entrada e a cada 50 metros nos corredores. Banheiros acessíveis com trocadores de bebês ficam nos hubs Norte e Sul.",
        "The Medical Center is located near Gate A on Level 1. It is staffed by paramedics and doctors throughout the event. For emergencies, call the stadium emergency line or approach any orange-vested volunteer.":
            "O Centro Médico fica no Nível 1 próximo ao Portão A. Há médicos e paramédicos de plantão. Para emergências, procure voluntários de colete laranja.",
        "Lost and Found is located at the Fan Services desk near Gate B. If you lose an item during the match, report it during the event or within 24 hours after. Items are kept for 30 days.":
            "Achados e perdidos ficam no balcão de atendimento no Portão B. Comunique perdas em até 24 horas. Itens guardados por 30 dias.",
        "Baby-changing stations and family restrooms are available on Level 1 near Sections 101 and 115, and on Level 2 near Section 212.":
            "Trocadores de bebês e banheiros familiares ficam no Nível 1 (Setores 101/115) e Nível 2 (Setor 212).",
        "Seating sections are divided into three levels: Lower Bowl (Sections 100–150), Club Level (Sections 200–250), and Upper Bowl (Sections 300–350). Each section number corresponds to a specific area of the stadium. The first digit indicates the level.":
            "Assentos divididos em 3 níveis: Inferior (100-150), Club (200-250) e Superior (300-350). O primeiro dígito indica o nível.",
        "If you cannot find your seat, look for the section number printed on the nearest column or overhead sign. Ushers in yellow vests are stationed at every section entrance and can direct you to your specific row and seat.":
            "Se não achar o assento, olhe o setor nas colunas. Orientadores de colete amarelo estão nas entradas dos setores para ajudar.",
        "Accessible seating areas are located in Sections 103, 125, 203, 225, 303, and 325. Companion seating is available adjacent to each accessible position. Contact Fan Services at Gate B for assistance.":
            "Assentos acessíveis ficam nos Setores 103, 125, 203, 225, 303 e 325. Assentos para acompanhantes ficam ao lado. Ajuda no Portão B.",
        "Food Court on Level 1 features 24 vendors including international cuisine representing all 32 World Cup nations. Open 3 hours before kickoff until 1 hour after the final whistle. Cashless payment only — all major cards and mobile payments accepted.":
            "Praça de alimentação no Nível 1 tem 24 marcas com comidas das 32 nações da Copa. Sem pagamento em dinheiro (apenas cartões/celular).",
        "Concession stands on every concourse level offer hot dogs, burgers, pizza, nachos, pretzels, and non-alcoholic beverages. Specialty stands offer halal, kosher, vegetarian, and vegan options — look for the colored flag icons above each stand.":
            "Lanchonetes nos corredores servem hot-dogs, hambúrgueres, pizza e refrigerantes. Opções veganas/vegetarianas têm bandeiras coloridas.",
        "Alcoholic beverages are available at designated areas on Level 1 and Level 2 for fans aged 21+ with valid ID. Alcohol service stops at 15 minutes before the end of the second half.":
            "Bebidas alcoólicas à venda nos Níveis 1 e 2 para maiores de 21 anos com RG/passaporte. Vendas encerram 15 min antes do fim do jogo.",
        "Outside food and beverages are not permitted inside the stadium. One factory-sealed water bottle (up to 1 liter) per person is allowed. No outside alcohol is permitted under any circumstances.":
            "Entrada com comida/bebida de fora proibida. Permitido 1 garrafa de água lacrada (até 1L) por pessoa. Álcool proibido.",
        "Parking Lot A is the official FIFA World Cup parking area adjacent to the stadium. Capacity is 5,000 vehicles. Pre-purchase parking passes online — no cash parking on match day. Gates open 4 hours before kickoff.":
            "Estacionamento A é o estacionamento oficial FIFA (5000 vagas). Compra obrigatória pela internet. Abre 4h antes do jogo.",
        "Public transportation is strongly recommended. NJ Transit operates dedicated express trains to MetLife Stadium from Penn Station (New York) and Secaucus Junction, starting 3 hours before kickoff. No additional ticket required beyond the train fare.":
            "Transporte público recomendado. Trens expressos da NJ Transit saem de Penn Station (NY) e Secaucus 3h antes do jogo.",
        "Ride-share drop-off and pick-up is designated in Lot B (Yellow Zone). Follow the blue signs from the main road. Expect 20-45 minute waits after the match — consider waiting 30 minutes inside before heading to the pick-up zone.":
            "Embarque de apps de transporte no Estacionamento B (Zona Amarela). Siga placas azuis. Espera de 20-45 min após o jogo.",
        "FIFA World Cup 2026 matches at MetLife Stadium: Kickoff times are typically 15:00, 18:00, or 21:00 local time. The stadium schedule is updated daily and displayed on the large screens at each entrance.":
            "Jogos da Copa 2026: Início às 15:00, 18:00 ou 21:00. O calendário diário é exibido nos telões das entradas do estádio.",
        "Half-time lasts 15 minutes. Extra time (if applicable) adds two 15-minute periods. Penalty shootouts follow if scores are level after extra time in knockout rounds. Match duration including stoppages averages 100-110 minutes.":
            "Intervalo de 15 min. Prorrogação de 2 tempos de 15 min. Pênaltis em caso de empate persistente no mata-mata. Jogo dura 100-110 min.",
        "Stadium gates open 2.5 hours before kickoff. The pre-match show begins 45 minutes before kickoff. Fan zones outside the stadium open 4 hours before kickoff with live music, food trucks, and interactive experiences.":
            "Portões abrem 2h30 antes. Show pré-jogo inicia 45 min antes. Fan zones externas abrem 4h antes com atrações.",
        "Prohibited items include: professional cameras with detachable lenses, tripods, laser pointers, flares, fireworks, drones, weapons, large bags (over 12x6x12 inches), and noise-making devices other than vuvuzelas (limited).":
            "Itens proibidos: câmeras profissionais, tripés, lasers, fogos, drones, armas, bolsas grandes, vuvuzelas acima do limite.",
        "FIFA's Code of Conduct applies at all times. Racist, discriminatory, or offensive behavior will result in immediate ejection from the stadium without refund, and potential legal action. Report incidents to the nearest security officer or call the fan incident hotline.":
            "Código de Conduta da FIFA em vigor. Racismo e discriminação causam expulsão imediata do estádio. Avise a segurança.",
        "Bags larger than 12x6x12 inches are not permitted. Clear bags are recommended for faster security screening. Stadium security screening opens 2.5 hours before kickoff. Walk-through metal detectors and bag X-ray machines are in use at all gates.":
            "Bolsas maiores que 12x6x12 polegadas proibidas. Bolsas transparentes recomendadas. Revistas iniciam 2h30 antes nos portões.",
        "Photography and video recording for personal use is permitted throughout the match. Commercial photography and broadcasting require FIFA-issued credentials. Selfie sticks are allowed but must not obstruct the view of other fans.":
            "Fotos e vídeos para uso pessoal permitidos. Uso comercial ou transmissões exigem credenciais FIFA. Bastão de selfie permitido.",
        "To navigate between levels: escalators and elevators are located at Gate A (Level 1-3), Gate B (Level 1-3), the North Concourse Hub (Level 1-3), and the South Concourse Hub (Level 1-3). Stairwells are at every gate and section entrance.":
            "Navegação de andares: escadas rolantes e elevadores nos Portões A, B e hubs Norte/Sul. Escadas de pedestres em todos setores.",
        "If you are approaching from Parking Lot A or the NJ Transit Station, follow the green pathway signs to Gate A or Gate B. Fans from the bus drop-off zone should follow orange pathway signs to Gate C or Gate D.":
            "Vindo do Estacionamento A ou Trem NJ Transit, siga linhas verdes para Portões A/B. Do ônibus, siga linhas laranjas para Portões C/D.",
    },
    "Hindi": {
        # UI & System Messages
        "Based on our stadium info:": "हमारे स्टेडियम की जानकारी के आधार पर:",
        "Additionally:": "इसके अतिरिक्त:",
        "I don't have that information available right now. Please check with a volunteer or visit Fan Services at Gate B — they're wearing bright orange vests and will be happy to help! 🏟️":
            "अभी वह जानकारी उपलब्ध नहीं है। कृपया गेट बी पर किसी स्वयंसेवक या प्रशंसक सेवा से मिलें — वे नारंगी जैकेट में होंगे और सहायता करने में प्रसन्न होंगे। 🏟️",
        "I don't have specific information on that. For anything not covered here, please check with a volunteer or Fan Services at Gate B — they'll be happy to help! 🏟️":
            "मेरे पास इस बारे में कोई विशिष्ट जानकारी नहीं है। किसी भी अन्य जानकारी के लिए, कृपया गेट बी पर किसी स्वयंसेवक या प्रशंसक सेवा से संपर्क करें - वे आपकी सहायता करने में प्रसन्न हॏंगे! 🏟️",

        # Knowledge Chunks (Concise Translations)
        "MetLife Stadium has four main entrances: Gate A (South), Gate B (North), Gate C (East), and Gate D (West). Each gate has dedicated ticket scanning lanes. Gates open 2.5 hours before kickoff.":
            "मेटलाइफ स्टेडियम के चार मुख्य प्रवेश द्वार हैं: गेट ए (दक्षिण), गेट बी (उत्तर), गेट सी (पूर्व) और गेट डी (पश्चिम)। प्रवेश द्वार मैच से 2.5 घंटे पहले खुलते हैं।",
        "Restrooms are located at every gate entrance and at 50-meter intervals along each concourse. Accessible restrooms with baby-changing facilities are available at the North and South Concourse hubs.":
            "शौचालय प्रत्येक गेट और हर 50 मीटर की दूरी पर स्थित हैं। उत्तरी और दक्षिणी हब पर दिव्यांग अनुकूल शौचालय उपलब्ध हैं।",
        "The Medical Center is located near Gate A on Level 1. It is staffed by paramedics and doctors throughout the event. For emergencies, call the stadium emergency line or approach any orange-vested volunteer.":
            "मेडिकल सेंटर गेट ए के पास लेवल 1 पर है। आपातकालीन सहायता के लिए नारंगी जैकेट पहने किसी भी स्वयंसेवक से संपर्क करें।",
        "Lost and Found is located at the Fan Services desk near Gate B. If you lose an item during the match, report it during the event or within 24 hours after. Items are kept for 30 days.":
            "खोया और पाया विभाग गेट बी के पास प्रशंसक सेवा डेस्क पर है। खोई हुई वस्तुएं 30 दिनों के लिए रखी जाती हैं।",
        "Baby-changing stations and family restrooms are available on Level 1 near Sections 101 and 115, and on Level 2 near Section 212.":
            "शिशु देखभाल केंद्र और पारिवारिक शौचालय लेवल 1 (सेक्शन 101 और 115) और लेवल 2 (सेक्शन 212) के पास हैं।",
        "Seating sections are divided into three levels: Lower Bowl (Sections 100–150), Club Level (Sections 200–250), and Upper Bowl (Sections 300–350). Each section number corresponds to a specific area of the stadium. The first digit indicates the level.":
            "बैठने की जगह 3 स्तरों में बंटी है: लोअर बाउल (100-150), क्लब लेवल (200-250) और अपर बाउल (300-350)। पहला अंक स्तर को दर्शाता है।",
        "If you cannot find your seat, look for the section number printed on the nearest column or overhead sign. Ushers in yellow vests are stationed at every section entrance and can direct you to your specific row and seat.":
            "यदि आपको अपनी सीट नहीं मिल रही, तो खंभों पर लिखे सेक्शन नंबर को देखें या पीली जैकेट पहने गाइड की मदद लें।",
        "Accessible seating areas are located in Sections 103, 125, 203, 225, 303, and 325. Companion seating is available adjacent to each accessible position. Contact Fan Services at Gate B for assistance.":
            "दिव्यांगों के लिए विशेष सीटें सेक्शन 103, 125, 203, 225, 303 और 325 में हैं। गेट बी पर प्रशंसक सेवा से संपर्क करें।",
        "Food Court on Level 1 features 24 vendors including international cuisine representing all 32 World Cup nations. Open 3 hours before kickoff until 1 hour after the final whistle. Cashless payment only — all major cards and mobile payments accepted.":
            "लेवल 1 पर स्थित फूड कोर्ट में विश्व कप के 32 देशों के व्यंजन उपलब्ध हैं। केवल डिजिटल भुगतान (कार्ड/मोबाइल) ही स्वीकार्य हैं।",
        "Concession stands on every concourse level offer hot dogs, burgers, pizza, nachos, pretzels, and non-alcoholic beverages. Specialty stands offer halal, kosher, vegetarian, and vegan options — look for the colored flag icons above each stand.":
            "कॉनकोर्स स्तरों पर बने काउंटरों पर हॉट डॉग, बर्गर, पिज्जा और कोल्ड-ड्रिंक्स मिलते हैं। शाकाहारी विकल्पों के लिए रंगीन फ्लैग देखें।",
        "Alcoholic beverages are available at designated areas on Level 1 and Level 2 for fans aged 21+ with valid ID. Alcohol service stops at 15 minutes before the end of the second half.":
            "21+ आयु के प्रशंसकों के लिए आईडी दिखाने पर अल्कोहल उपलब्ध है। मैच समाप्त होने के 15 मिनट पहले बिक्री बंद कर दी जाती है।",
        "Outside food and beverages are not permitted inside the stadium. One factory-sealed water bottle (up to 1 liter) per person is allowed. No outside alcohol is permitted under any circumstances.":
            "बाहरी खाना-पीना वर्जित है। केवल 1 लीटर की सीलबंद पानी की बोतल लाने की अनुमति है। बाहरी शराब सख्त वर्जित है।",
        "Parking Lot A is the official FIFA World Cup parking area adjacent to the stadium. Capacity is 5,000 vehicles. Pre-purchase parking passes online — no cash parking on match day. Gates open 4 hours before kickoff.":
            "पार्किंग लॉट ए आधिकारिक फीफा पार्किंग है (5000 वाहन)। पास ऑनलाइन खरीदें। मैच से 4 घंटे पहले पार्किंग खुलती है।",
        "Public transportation is strongly recommended. NJ Transit operates dedicated express trains to MetLife Stadium from Penn Station (New York) and Secaucus Junction, starting 3 hours before kickoff. No additional ticket required beyond the train fare.":
            "सार्वजनिक परिवहन की सलाह दी जाती है। एनजे ट्रांजिट एक्सप्रेस ट्रेनें मैच से 3 घंटे पहले चलना शुरू होती हैं।",
        "Ride-share drop-off and pick-up is designated in Lot B (Yellow Zone). Follow the blue signs from the main road. Expect 20-45 minute waits after the match — consider waiting 30 minutes inside before heading to the pick-up zone.":
            "राइड-शेयर कैब पिक-अप लॉट बी (येलो ज़ोन) में है। मैच के बाद भीड़ से बचने के लिए अंदर 30 मिनट रुकने पर विचार करें।",
        "FIFA World Cup 2026 matches at MetLife Stadium: Kickoff times are typically 15:00, 18:00, or 21:00 local time. The stadium schedule is updated daily and displayed on the large screens at each entrance.":
            "फीफा विश्व कप 2026 मैच दोपहर 3:00, शाम 6:00 या रात 9:00 बजे शुरू होते हैं। शेड्यूल प्रवेश द्वारों पर स्क्रीन पर दिखाया जाता है।",
        "Half-time lasts 15 minutes. Extra time (if applicable) adds two 15-minute periods. Penalty shootouts follow if scores are level after extra time in knockout rounds. Match duration including stoppages averages 100-110 minutes.":
            "हाफ-टाइम 15 मिनट का होता है। नॉकआउट में ड्रॉ होने पर एक्स्ट्रा टाइम (30 मिनट) और पेनल्टी शूटआउट होता है। कुल समय 100-110 मिनट।",
        "Stadium gates open 2.5 hours before kickoff. The pre-match show begins 45 minutes before kickoff. Fan zones outside the stadium open 4 hours before kickoff with live music, food trucks, and interactive experiences.":
            "स्टेडियम के गेट मैच से 2.5 घंटे पहले खुलते हैं। बाहरी फैन ज़ोन लाइव संगीत और फूड ट्रकों के साथ 4 घंटे पहले खुलते हैं।",
        "Prohibited items include: professional cameras with detachable lenses, tripods, laser pointers, flares, fireworks, drones, weapons, large bags (over 12x6x12 inches), and noise-making devices other than vuvuzelas (limited).":
            "वर्जित वस्तुएं: भारी कैमरे, स्टैंड, लेज़र लाइट, पटाखे, ड्रोन, हथियार, बड़े बैग और शोर मचाने वाले यंत्र।",
        "FIFA's Code of Conduct applies at all times. Racist, discriminatory, or offensive behavior will result in immediate ejection from the stadium without refund, and potential legal action. Report incidents to the nearest security officer or call the fan incident hotline.":
            "फीफा आचार संहिता लागू है। नस्लवादी या अपमानजनक व्यवहार करने पर तुरंत स्टेडियम से बाहर कर दिया जाएगा। सुरक्षाकर्मी को बताएं।",
        "Bags larger than 12x6x12 inches are not permitted. Clear bags are recommended for faster security screening. Stadium security screening opens 2.5 hours before kickoff. Walk-through metal detectors and bag X-ray machines are in use at all gates.":
            "12x6x12 इंच से बड़े बैग प्रतिबंधित हैं। तेजी से सुरक्षा जांच के लिए पारदर्शी (क्लियर) बैग का उपयोग करें।",
        "Photography and video recording for personal use is permitted throughout the match. Commercial photography and broadcasting require FIFA-issued credentials. Selfie sticks are allowed but must not obstruct the view of other fans.":
            "व्यक्तिगत उपयोग के लिए फोटो-वीडियो मान्य है। व्यावसायिक प्रसारण के लिए फीफा कार्ड आवश्यक है। सेल्फी स्टिक मान्य है।",
        "To navigate between levels: escalators and elevators are located at Gate A (Level 1-3), Gate B (Level 1-3), the North Concourse Hub (Level 1-3), and the South Concourse Hub (Level 1-3). Stairwells are at every gate and section entrance.":
            "स्तरों के बीच जाने के लिए: गेट ए, गेट बी, उत्तरी और दक्षिणी हब पर एस्केलेटर और लिफ्ट हैं। सीढ़ियां भी उपलब्ध हैं।",
        "If you are approaching from Parking Lot A or the NJ Transit Station, follow the green pathway signs to Gate A or Gate B. Fans from the bus drop-off zone should follow orange pathway signs to Gate C or Gate D.":
            "पार्किंग लॉट ए या एनजे ट्रांजिट से आने पर गेट ए/बी के लिए हरे निशान और बस स्टॉप से आने पर गेट सी/डी के लिए नारंगी निशान का पालन करें।",
    },
    "Arabic": {
        # UI & System Messages
        "Based on our stadium info:": "بناءً على معلومات الملعب الخاصة بنا:",
        "Additionally:": "بالإضافة إلى ذلك:",
        "_— StadiumMind (running in offline mode; full AI answers available when Gemini quota is enabled)_":
            "_— StadiumMind (يعمل في وضع عدم الاتصال؛ تتوفر إجابات الذكاء الاصطناعي الكاملة عند تمكين حصة Gemini)_",
        "I don't have specific information on that. For anything not covered here, please check with a volunteer or Fan Services at Gate B — they'll be happy to help! 🏟️":
            "ليس لدي معلومات محددة حول هذا الموضوع. لأي شيء لم يتم تغطيته هنا، يرجى مراجعة أحد المتطوعين أو خدمات المشجعين عند البوابة B - وسيكونون سعداء بمساعدتك! 🏟️",
        "The stadium AI assistant is temporarily running in power-saver mode. Real-time answering is offline, but did you know: Gates open 2.5 hours before kickoff, and restrooms are located along each concourse level!":
            "يعمل مساعد الذكاء الاصطناعي بالملعب مؤقتًا في وضع توفير الطاقة. الاستجابة في الوقت الفعلي غير متصلة بالإنترنت، ولكن هل تعلم: تفتح البوابات قبل ساعتين ونصف من ركلة البداية، وتوجد دورات المياه على طول كل مستوى من الممرات!",
            
        # Knowledge Chunks (Concise Translations)
        "MetLife Stadium has four main entrances: Gate A (South), Gate B (North), Gate C (East), and Gate D (West). Each gate has dedicated ticket scanning lanes. Gates open 2.5 hours before kickoff.":
            "يحتوي ملعب ميتلايف على أربعة مداخل رئيسية: البوابة A (الجنوب)، البوابة B (الشمال)، البوابة C (الشرق)، البوابة D (الغرب). تفتح قبل ساعتين ونصف.",
        "Restrooms are located at every gate entrance and at 50-meter intervals along each concourse. Accessible restrooms with baby-changing facilities are available at the North and South Concourse hubs.":
            "توجد دورات المياه عند كل مدخل وعلى مسافات 50 مترًا في الممرات. تتوفر حمامات مهيأة ومجهزة للأطفال في المحورين الشمالي والجنوبي.",
        "The Medical Center is located near Gate A on Level 1. It is staffed by paramedics and doctors throughout the event. For emergencies, call the stadium emergency line or approach any orange-vested volunteer.":
            "المركز الطبي يقع قرب البوابة A بالدور 1. لحالات الطوارئ، اتصل بخط الملعب أو توجه لأي متطوع يرتدي سترة برتقالية.",
        "Lost and Found is located at the Fan Services desk near Gate B. If you lose an item during the match, report it during the event or within 24 hours after. Items are kept for 30 days.":
            "المفقودات والموجودات في مكتب خدمات المشجعين قرب البوابة B. يتم الاحتفاظ بالمواد المفقودة لمدة 30 يومًا.",
        "Baby-changing stations and family restrooms are available on Level 1 near Sections 101 and 115, and on Level 2 near Section 212.":
            "طاولات تغيير للأطفال وحمامات عائلية بالدور 1 (قرب الأقسام 101 و115) وبالدور 2 (قرب القسم 212).",
        "Seating sections are divided into three levels: Lower Bowl (Sections 100–150), Club Level (Sections 200–250), and Upper Bowl (Sections 300–350). Each section number corresponds to a specific area of the stadium. The first digit indicates the level.":
            "المقاعد مقسمة 3 مستويات: المدرج السفلي (100-150)، ومستوى النادي (200-250)، والمدرج العلوي (300-350). الرقم الأول يشير للمستوى.",
        "If you cannot find your seat, look for the section number printed on the nearest column or overhead sign. Ushers in yellow vests are stationed at every section entrance and can direct you to your specific row and seat.":
            "إذا لم تجد مقعدك، ابحث عن رقم القسم المكتوب على الأعمدة أو استعن بالمرشدين الذين يرتدون سترات صفراء.",
        "Accessible seating areas are located in Sections 103, 125, 203, 225, 303, and 325. Companion seating is available adjacent to each accessible position. Contact Fan Services at Gate B for assistance.":
            "توجد مقاعد ذوي الاحتياجات الخاصة في الأقسام 103 و125 و203 و225 و303 و325. للمساعدة، توجه للبوابة B.",
        "Food Court on Level 1 features 24 vendors including international cuisine representing all 32 World Cup nations. Open 3 hours before kickoff until 1 hour after the final whistle. Cashless payment only — all major cards and mobile payments accepted.":
            "صالة الطعام بالدور 1 تضم 24 منفذًا تمثل أطعمة الدول الـ32. الدفع إلكتروني بالكامل (بطاقات أو جوال).",
        "Concession stands on every concourse level offer hot dogs, burgers, pizza, nachos, pretzels, and non-alcoholic beverages. Specialty stands offer halal, kosher, vegetarian, and vegan options — look for the colored flag icons above each stand.":
            "منافذ البيع بالممرات تقدم وجبات خفيفة ومشروبات غير كحولية. تتوفر خيارات حلال ونباتية مميزة برموز أعلام ملونة.",
        "Alcoholic beverages are available at designated areas on Level 1 and Level 2 for fans aged 21+ with valid ID. Alcohol service stops at 15 minutes before the end of the second half.":
            "تتوفر المشروبات الكحولية في مناطق محددة بالدورين 1 و2 لمن هم فوق 21 سنة. يتوقف البيع قبل 15 دقيقة من نهاية المباراة.",
        "Outside food and beverages are not permitted inside the stadium. One factory-sealed water bottle (up to 1 liter) per person is allowed. No outside alcohol is permitted under any circumstances.":
            "يمنع إدخال الأطعمة والمشروبات الخارجية. يسمح بزجاجة مياه واحدة مغلقة (حتى 1 لتر). يمنع إدخال الكحول نهائيًا.",
        "Parking Lot A is the official FIFA World Cup parking area adjacent to the stadium. Capacity is 5,000 vehicles. Pre-purchase parking passes online — no cash parking on match day. Gates open 4 hours before kickoff.":
            "الموقف A هو موقف الفيفا الرسمي للملعب (سعة 5000 سيارة). الحجز مسبق عبر الإنترنت فقط. يفتح قبل 4 ساعات.",
        "Public transportation is strongly recommended. NJ Transit operates dedicated express trains to MetLife Stadium from Penn Station (New York) and Secaucus Junction, starting 3 hours before kickoff. No additional ticket required beyond the train fare.":
            "ينصح بشدة بالنقل العام. تعمل قطارات NJ Transit السريعة إلى الملعب قبل 3 ساعات من المباراة.",
        "Ride-share drop-off and pick-up is designated in Lot B (Yellow Zone). Follow the blue signs from the main road. Expect 20-45 minute waits after the match — consider waiting 30 minutes inside before heading to the pick-up zone.":
            "نقطة التقاء سيارات الأجرة في الموقف B (المنطقة الصفراء). يفضل الانتظار 30 دقيقة داخل الملعب قبل الخروج لتجنب الازدحام.",
        "FIFA World Cup 2026 matches at MetLife Stadium: Kickoff times are typically 15:00, 18:00, or 21:00 local time. The stadium schedule is updated daily and displayed on the large screens at each entrance.":
            "مباريات كأس العالم 2026: تنطلق عادة في 15:00 أو 18:00 أو 21:00 بالتوقيت المحلي. يعرض الجدول على الشاشات الكبيرة.",
        "Half-time lasts 15 minutes. Extra time (if applicable) adds two 15-minute periods. Penalty shootouts follow if scores are level after extra time in knockout rounds. Match duration including stoppages averages 100-110 minutes.":
            "الاستراحة 15 دقيقة. الأشواط الإضافية (إن وجدت) تمتد لنصف ساعة ثم ركلات ترجيح. معدل وقت المباراة 100-110 دقائق.",
        "Stadium gates open 2.5 hours before kickoff. The pre-match show begins 45 minutes before kickoff. Fan zones outside the stadium open 4 hours before kickoff with live music, food trucks, and interactive experiences.":
            "تفتح الأبواب قبل ساعتين ونصف. العرض التمهيدي يبدأ قبل 45 دقيقة. مناطق المشجعين بالخارج تفتح قبل 4 ساعات.",
        "Prohibited items include: professional cameras with detachable lenses, tripods, laser pointers, flares, fireworks, drones, weapons, large bags (over 12x6x12 inches), and noise-making devices other than vuvuzelas (limited).":
            "المواد الممنوعة: كاميرات احترافية، حوامل، ليزر، ألعاب نارية، طائرات بدون طيار، أسلحة، حقائب كبيرة وأجهزة الضوضاء.",
        "FIFA's Code of Conduct applies at all times. Racist, discriminatory, or offensive behavior will result in immediate ejection from the stadium without refund, and potential legal action. Report incidents to the nearest security officer or call the fan incident hotline.":
            "قواعد سلوك الفيفا تسري دائمًا. أي سلوك عنصري أو مسيء يؤدي للطرد الفوري من الملعب والملاحقة. أبلغ الأمن.",
        "Bags larger than 12x6x12 inches are not permitted. Clear bags are recommended for faster security screening. Stadium security screening opens 2.5 hours before kickoff. Walk-through metal detectors and bag X-ray machines are in use at all gates.":
            "الحقائب التي تتجاوز 12x6x12 بوصة ممنوعة. يوصى بالحقائب الشفافة لتسريع التفتيش الذي يبدأ قبل ساعتين ونصف.",
        "Photography and video recording for personal use is permitted throughout the match. Commercial photography and broadcasting require FIFA-issued credentials. Selfie sticks are allowed but must not obstruct the view of other fans.":
            "التصوير للاستخدام الشخصي مسموح. التصوير التجاري يتطلب تصاريح الفيفا. يسمح بعصا السيلفي بشرط عدم إزعاج الآخرين.",
        "To navigate between levels: escalators and elevators are located at Gate A (Level 1-3), Gate B (Level 1-3), the North Concourse Hub (Level 1-3), and the South Concourse Hub (Level 1-3). Stairwells are at every gate and section entrance.":
            "التنقل بين الأدوار: مصاعد وسلالم كهربائية عند البوابات A وB والمحاور الشمالية والجنوبية. السلالم متوفرة عند كل مدخل.",
        "If you are approaching from Parking Lot A or the NJ Transit Station, follow the green pathway signs to Gate A or Gate B. Fans from the bus drop-off zone should follow orange pathway signs to Gate C or Gate D.":
            "إذا كنت قادمًا من الموقف A أو قطار NJ Transit، اتبع المسار الأخضر للبوابات A/B. من موقف الحافلات، اتبع المسار البرتقالي للبوابات C/D.",
    }
}
